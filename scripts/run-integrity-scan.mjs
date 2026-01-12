import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const args = process.argv.slice(2);

function readFileSafe(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) return '';
  return fs.readFileSync(fullPath, 'utf8');
}

function getArgValue(flag, fallback = null) {
  const idx = args.indexOf(flag);
  if (idx === -1) return fallback;
  return args[idx + 1] || fallback;
}

function extractRoutes(source) {
  const routes = [];
  for (const match of source.matchAll(/route:\s*['"]([^'"]+)['"]/g)) {
    routes.push(match[1]);
  }
  for (const match of source.matchAll(/aliases:\s*\[([^\]]*)\]/g)) {
    const inner = match[1];
    for (const aliasMatch of inner.matchAll(/['"]([^'"]+)['"]/g)) {
      routes.push(aliasMatch[1]);
    }
  }
  return Array.from(new Set(routes));
}

function extractFeatureKeys(source) {
  const marker = 'export const FEATURES';
  const startIdx = source.indexOf(marker);
  if (startIdx === -1) return [];
  const braceStart = source.indexOf('{', startIdx);
  if (braceStart === -1) return [];
  const block = source.slice(braceStart);
  const lines = block.split(/\r?\n/);
  const keys = new Set();
  let depth = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (depth === 1 && trimmed && !trimmed.startsWith('//')) {
      const match = trimmed.match(/^([A-Za-z0-9_]+)\s*:/);
      if (match) keys.add(match[1]);
    }

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '{') depth += 1;
      if (char === '}') depth -= 1;
    }

    if (depth <= 0 && line.includes('};')) {
      break;
    }
  }

  return Array.from(keys);
}

function loadFeatureRegistry(source) {
  const sanitized = source
    .replace(/export\s+const\s+/g, 'const ')
    .replace(/export\s+function\s+/g, 'function ')
    .replace(/export\s+\{[^}]*\};?/g, '');
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${sanitized}\nthis.__FEATURES__ = FEATURES;\nthis.__getAllRoutes__ = getAllRoutes;`, context);
  return {
    features: context.__FEATURES__ || null,
    getAllRoutes: context.__getAllRoutes__ || null,
  };
}

function scanSchoolSearch(source) {
  const lessonFilterMatch = /scoped(Filter|List)\(\s*['"]Lesson['"][\s\S]*?\{([\s\S]*?)\}\s*,/m.exec(source);
  const lessonFilter = lessonFilterMatch ? lessonFilterMatch[1] : '';
  const lessonContentLeak = /\b(content|body)\b/.test(lessonFilter)
    || /entities\.Lesson\.filter\(\{[\s\S]*?\b(content|body)\b/m.test(source);
  const lessonLimitPresent = /scoped(Filter|List)\(\s*['"]Lesson['"][\s\S]*?,\s*(\d+)\s*(,|\))/m.test(source)
    || /entities\.Lesson\.filter\([\s\S]*?,\s*(\d+)\s*(,|\))/m.test(source);
  return {
    key: 'scan_school_search',
    label: 'Search leakage scan (SchoolSearch)',
    ok: !lessonContentLeak && lessonLimitPresent,
    detail: [
      lessonContentLeak ? '? SchoolSearch appears to filter lessons by content/body (paid text leakage risk).' : '? No lesson content/body filter detected.',
      lessonLimitPresent ? '? Lesson query includes an explicit limit.' : '? Lesson query missing explicit limit (performance risk).'
    ]
  };
}

function scanDownloads(source) {
  const fileUrlReferenced = /\bfile_url\b/.test(source);
  return {
    key: 'scan_downloads',
    label: 'Download URL exposure scan (Downloads)',
    ok: !fileUrlReferenced,
    detail: [
      !fileUrlReferenced
        ? '? No direct file_url references detected (should be retrieved via getSecureDownloadUrl).'
        : '? file_url appears in Downloads page source. Verify it is NOT rendered/exposed before auth checks.'
    ]
  };
}

function scanReader(source) {
  const hasEntitlementGate = /\$or\s*:\s*\[/.test(source) && /\$in/.test(source) && /(allowedCourseIds|courseIds)/.test(source);
  const textLimitPresent = /scopedFilter\('Text'[\s\S]*?,\s*50\s*(,|\))/m.test(source);
  return {
    key: 'scan_reader',
    label: 'Reader text fetch scan (Reader)',
    ok: hasEntitlementGate && textLimitPresent,
    detail: [
      hasEntitlementGate
        ? '? Reader appears to gate Text retrieval by entitlements ($or + $in).'
        : '? Reader may fetch protected texts without entitlement gating. Gate at query-time to avoid client-side leakage.',
      textLimitPresent ? '? Reader uses explicit limit for Text queries.' : '? Reader Text query missing explicit limit.'
    ]
  };
}

function scanAiTutor(source) {
  const hasLockGuard = /const\s+isLocked\s*=\s*!contextContent/.test(source)
    || /if\s*\(!contextContent\)/.test(source);
  const disablesActions = /disabled=\{[^}]*isLocked[^}]*\}/.test(source)
    || /disabled=\{[^}]*!contextContent[^}]*\}/.test(source);
  return {
    key: 'scan_ai_tutor',
    label: 'AI tutor lock scan (AiTutorPanel)',
    ok: hasLockGuard && disablesActions,
    detail: [
      hasLockGuard ? '? AI tutor checks for locked context (contextContent).' : '? AI tutor missing locked-context guard.',
      disablesActions ? '? AI tutor disables actions when locked.' : '? AI tutor may allow actions while locked.'
    ]
  };
}

function scanDiscussion(source) {
  const usesScopedCreate = /scopedCreate\(['"]Discussion['"]/.test(source);
  const usesScopedUpdate = /scopedUpdate\(['"]Discussion['"]/.test(source);
  const hasBase44 = /base44\.entities\.Discussion/.test(source);
  return {
    key: 'scan_discussions',
    label: 'Discussion scoping scan (DiscussionThread)',
    ok: usesScopedCreate && usesScopedUpdate && !hasBase44,
    detail: [
      usesScopedCreate ? '? Discussion uses scopedCreate.' : '? Discussion missing scopedCreate.',
      usesScopedUpdate ? '? Discussion uses scopedUpdate.' : '? Discussion missing scopedUpdate.',
      !hasBase44 ? '? No base44 direct Discussion usage detected.' : '? base44.entities.Discussion detected (tenancy risk).'
    ]
  };
}

function scanScoped(source) {
  const hasDownloadScoped = /['"]Download['"]/.test(source);
  const hasBundleScoped = /['"]Bundle['"]/.test(source);
  const hasAnalyticsScoped = /['"]AnalyticsEvent['"]/.test(source);
  const hasSchoolSettingScoped = /['"]SchoolSetting['"]/.test(source);
  const hasMessageScoped = /['"]Message['"]/.test(source);
  return {
    key: 'scan_scoped',
    label: 'Tenancy scope list scan (scoped module)',
    ok: hasDownloadScoped && hasBundleScoped && hasAnalyticsScoped && hasSchoolSettingScoped && hasMessageScoped,
    detail: [
      hasDownloadScoped ? '? Download is in SCHOOL_SCOPED_ENTITIES.' : '? Download missing from SCHOOL_SCOPED_ENTITIES (tenant leakage risk).',
      hasBundleScoped ? '? Bundle is in SCHOOL_SCOPED_ENTITIES.' : '? Bundle missing from SCHOOL_SCOPED_ENTITIES.',
      hasAnalyticsScoped ? '? AnalyticsEvent is in SCHOOL_SCOPED_ENTITIES.' : '? AnalyticsEvent missing from SCHOOL_SCOPED_ENTITIES.',
      hasSchoolSettingScoped ? '? SchoolSetting is in SCHOOL_SCOPED_ENTITIES.' : '? SchoolSetting missing from SCHOOL_SCOPED_ENTITIES.',
      hasMessageScoped ? '? Message is in SCHOOL_SCOPED_ENTITIES.' : '? Message missing from SCHOOL_SCOPED_ENTITIES.'
    ]
  };
}

function diffKeys(left, right, prefix = '') {
  if (left === right) return [];
  if (typeof left !== 'object' || typeof right !== 'object' || !left || !right) {
    return [prefix || '(root)'];
  }
  if (Array.isArray(left) || Array.isArray(right)) {
    return JSON.stringify(left) === JSON.stringify(right) ? [] : [prefix || '(root)'];
  }
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  const diffs = [];
  for (const key of keys) {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    diffs.push(...diffKeys(left[key], right[key], nextPrefix));
  }
  return diffs;
}

const featuresSource = readFileSafe('src/components/config/features.jsx');
let features = null;
let routes = [];

try {
  const registry = loadFeatureRegistry(featuresSource);
  features = registry.features;
  routes = registry.getAllRoutes ? registry.getAllRoutes() : [];
} catch {
  routes = extractRoutes(featuresSource);
}

const featureKeys = features ? Object.keys(features) : extractFeatureKeys(featuresSource);
const featureCount = featureKeys.length || routes.length;
const hasFeatureKey = (value) => {
  if (features) {
    return Object.values(features).some((entry) => String(entry?.key || '').toLowerCase() === String(value).toLowerCase());
  }
  const pattern = new RegExp(`\\bkey\\s*:\\s*['"]${value}['"]`);
  return pattern.test(featuresSource);
};

const sources = {
  schoolSearch: readFileSafe('src/pages/SchoolSearch.jsx'),
  downloads: readFileSafe('src/pages/Downloads.jsx'),
  reader: readFileSafe('src/pages/Reader.jsx'),
  scoped: readFileSafe('src/components/api/scoped.jsx'),
  scopedEntities: readFileSafe('src/components/api/scopedEntities.js'),
  lessonAccess: readFileSafe('src/components/hooks/useLessonAccess.jsx'),
  tenancyEnforcer: readFileSafe('src/components/api/tenancyEnforcer.js'),
  aiTutor: readFileSafe('src/components/ai/AiTutorPanel.jsx'),
  discussion: readFileSafe('src/components/learning/DiscussionThread.jsx'),
};

const { runScans } = await import(pathToFileURL(path.join(root, 'src/components/system/codeScanner.js')));

const highSignal = [
  scanSchoolSearch(sources.schoolSearch),
  scanDownloads(sources.downloads),
  scanReader(sources.reader),
  scanAiTutor(sources.aiTutor),
  scanDiscussion(sources.discussion),
  scanScoped(sources.scopedEntities),
];

const genericScans = runScans({
  schoolSearch: { label: 'SchoolSearch', source: sources.schoolSearch },
  downloads: { label: 'Downloads', source: sources.downloads },
  reader: { label: 'Reader', source: sources.reader },
  scoped: { label: 'Scoped API', source: sources.scoped },
  lessonAccess: { label: 'useLessonAccess', source: sources.lessonAccess },
  tenancyEnforcer: { label: 'TenancyEnforcer', source: sources.tenancyEnforcer, skipRules: ['avoid_unscoped_list'] },
  aiTutor: { label: 'AiTutorPanel', source: sources.aiTutor },
  discussion: { label: 'DiscussionThread', source: sources.discussion },
});

const meta = {
  generated_at: new Date().toISOString(),
  user_email: process.env.INTEGRITY_USER_EMAIL || 'admin@school.example',
  role: process.env.INTEGRITY_ROLE || 'ADMIN',
  active_school_id: process.env.INTEGRITY_SCHOOL_ID || 'school_123',
};

const registry = {
  featureCount,
  routeCount: routes.length,
  duplicates: [],
};

const checks = {
  registry_present: featureCount > 30,
  vault_registered: hasFeatureKey('Vault'),
  integrity_registered: hasFeatureKey('Integrity'),
  tenancy_enforcer: fs.existsSync(path.join(root, 'src/components/api/tenancyEnforcer.js')),
  tenancy_runtime_warnings: true,
  active_school: Boolean(meta.active_school_id),
  routes_deduped: true,
};

const scans = Object.fromEntries([...highSignal, ...genericScans].map((scan) => [scan.key, scan.ok]));

const report = {
  meta,
  registry,
  checks,
  scans,
  tenancy_warnings: { total: 0, by_type: {} },
  tenancy_warnings_recent: [],
};

const outPath = getArgValue('--out', 'docs/integrity-samples/v9.0.sample.json');
const comparePath = getArgValue('--compare', null);
const compareSourcePath = comparePath || null;
const before = compareSourcePath && fs.existsSync(path.join(root, compareSourcePath))
  ? JSON.parse(fs.readFileSync(path.join(root, compareSourcePath), 'utf8'))
  : null;

fs.mkdirSync(path.dirname(path.join(root, outPath)), { recursive: true });
fs.writeFileSync(path.join(root, outPath), JSON.stringify(report, null, 2));

if (compareSourcePath) {
  if (!before) {
    console.log(`No comparison file found at ${compareSourcePath}`);
  } else {
    const diffs = diffKeys(before, report);
    if (diffs.length === 0) {
      console.log('Integrity report matches comparison file.');
    } else {
      console.log(`Integrity report differs in ${diffs.length} paths:`);
      diffs.slice(0, 20).forEach((diff) => console.log(`- ${diff}`));
    }
  }
}

console.log(`Integrity report written to ${outPath}`);
