import React, { useEffect, useMemo, useState } from 'react';
import { FEATURES, getAllRoutes } from '@/components/config/features';
import { base44 } from '@/api/base44Client';
import { useSession } from '@/components/hooks/useSession';
import { isSchoolAdmin } from '@/components/auth/roles';
import { getTenancyWarnings, clearTenancyWarnings, getTenancyWarningsSummary } from '@/components/api/tenancyWarnings';
import { runScans } from '@/components/system/codeScanner';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, ClipboardCopy, Download, RefreshCw, Shield, AlertCircle } from 'lucide-react';
import { tokens, cx } from '@/components/theme/tokens';
import { Badge } from '@/components/ui/badge';

function safeJson(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return JSON.stringify({ error: 'Could not serialize report' }, null, 2);
  }
}

function StatusIcon({ ok }) {
  return ok ? 
    <CheckCircle2 className="h-5 w-5 text-green-500" /> : 
    <AlertTriangle className="h-5 w-5 text-amber-500" />;
}

function scanSchoolSearch(source) {
  const lessonContentLeak = /scoped(Filter|List)\(\s*['"]Lesson['"][\s\S]*?\{[\s\S]*?\b(content|body)\b/m.test(source)
    || /entities\.Lesson\.filter\(\{[\s\S]*?\b(content|body)\b/m.test(source);
  const lessonLimitPresent = /scoped(Filter|List)\(\s*['"]Lesson['"][\s\S]*?,\s*(\d+)\s*\)/m.test(source)
    || /entities\.Lesson\.filter\([\s\S]*?,\s*(\d+)\s*\)/m.test(source);
  return {
    key: 'scan_school_search',
    label: 'Search leakage scan (SchoolSearch)',
    ok: !lessonContentLeak && lessonLimitPresent,
    detail: [
      lessonContentLeak ? '❌ SchoolSearch appears to filter lessons by content/body (paid text leakage risk).' : '✅ No lesson content/body filter detected.',
      lessonLimitPresent ? '✅ Lesson query includes an explicit limit.' : '⚠️ Lesson query missing explicit limit (performance risk).'
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
        ? '✅ No direct file_url references detected (should be retrieved via getSecureDownloadUrl).'
        : '⚠️ file_url appears in Downloads page source. Verify it is NOT rendered/exposed before auth checks.'
    ]
  };
}

function scanReader(source) {
  const hasEntitlementGate = /\$or\s*:\s*\[/.test(source) && /\$in/.test(source) && /allowedCourseIds/.test(source);
  const textLimitPresent = /scopedFilter\('Text'[\s\S]*?,\s*50\)/m.test(source);
  return {
    key: 'scan_reader',
    label: 'Reader text fetch scan (Reader)',
    ok: hasEntitlementGate && textLimitPresent,
    detail: [
      hasEntitlementGate
        ? '✅ Reader appears to gate Text retrieval by entitlements ($or + $in).' 
        : '⚠️ Reader may fetch protected texts without entitlement gating. Gate at query-time to avoid client-side leakage.',
      textLimitPresent ? '✅ Reader uses explicit limit for Text queries.' : '⚠️ Reader Text query missing explicit limit.'
    ]
  };
}

function scanScoped(source) {
  const hasDownloadScoped = /['"]Download['"]/.test(source);
  const hasBundleScoped = /['"]Bundle['"]/.test(source);
  const hasAnalyticsScoped = /['"]AnalyticsEvent['"]/.test(source);
  return {
    key: 'scan_scoped',
    label: 'Tenancy scope list scan (scoped module)',
    ok: hasDownloadScoped && hasBundleScoped && hasAnalyticsScoped,
    detail: [
      hasDownloadScoped ? '✅ Download is in SCHOOL_SCOPED_ENTITIES.' : '⚠️ Download missing from SCHOOL_SCOPED_ENTITIES (tenant leakage risk).',
      hasBundleScoped ? '✅ Bundle is in SCHOOL_SCOPED_ENTITIES.' : '⚠️ Bundle missing from SCHOOL_SCOPED_ENTITIES.',
      hasAnalyticsScoped ? '✅ AnalyticsEvent is in SCHOOL_SCOPED_ENTITIES.' : '⚠️ AnalyticsEvent missing from SCHOOL_SCOPED_ENTITIES.'
    ]
  };
}

export default function Integrity() {
  const session = useSession();
  const { user, role, activeSchoolId, isLoading } = session;

  const [sources, setSources] = useState(null);
  const [reloading, setReloading] = useState(false);
  const [reloadNonce, setReloadNonce] = useState(0);
  const [tenancyTick, setTenancyTick] = useState(0);

  const canView = !!user && isSchoolAdmin(role);

  useEffect(() => {
    if (!canView) return undefined;
    const id = window.setInterval(() => {
      setTenancyTick((t) => (t + 1) % 1_000_000);
    }, 2000);
    return () => window.clearInterval(id);
  }, [canView]);

  useEffect(() => {
    if (!canView) return;
    let alive = true;

    const loadSources = async () => {
      try {
        setReloading(true);
        const [schoolSearch, downloads, reader, scoped, lessonAccess, tenancyEnforcer] = await Promise.all([
          import('./SchoolSearch.jsx?raw'),
          import('./Downloads.jsx?raw'),
          import('./Reader.jsx?raw'),
          import('../components/api/scoped.jsx?raw'),
          import('../components/hooks/useLessonAccess.jsx?raw'),
          import('../components/api/tenancyEnforcer.js?raw'),
        ]);
        if (!alive) return;
        setSources({
          schoolSearch: schoolSearch.default,
          downloads: downloads.default,
          reader: reader.default,
          scoped: scoped.default,
          lessonAccess: lessonAccess.default,
          tenancyEnforcer: tenancyEnforcer.default,
        });
      } catch (e) {
        console.warn('Integrity scans: failed to load source modules', e);
        if (!alive) return;
        setSources({ error: String(e) });
      } finally {
        if (alive) setReloading(false);
      }
    };

    loadSources();
    return () => {
      alive = false;
    };
  }, [canView, reloadNonce]);

  const registryStats = useMemo(() => {
    const featureCount = Object.keys(FEATURES || {}).length;
    const routes = getAllRoutes();
    const duplicates = routes.filter((r, idx) => routes.indexOf(r) !== idx);
    return {
      featureCount,
      routeCount: routes.length,
      duplicates: Array.from(new Set(duplicates))
    };
  }, []);

  const scans = useMemo(() => {
    if (!sources || sources.error) return [];
    const highSignal = [
      scanSchoolSearch(sources.schoolSearch),
      scanDownloads(sources.downloads),
      scanReader(sources.reader),
      scanScoped(sources.scoped)
    ];

    const generic = runScans({
      schoolSearch: { label: 'SchoolSearch', source: sources.schoolSearch },
      downloads: { label: 'Downloads', source: sources.downloads },
      reader: { label: 'Reader', source: sources.reader },
      scoped: { label: 'Scoped API', source: sources.scoped },
      lessonAccess: { label: 'useLessonAccess', source: sources.lessonAccess },
      tenancyEnforcer: { label: 'TenancyEnforcer', source: sources.tenancyEnforcer },
    });

    return [...highSignal, ...generic];
  }, [sources]);

  const coreChecks = useMemo(() => {
    const hasRegistry = !!FEATURES && Object.keys(FEATURES).length > 30;
    const hasActiveSchool = !!activeSchoolId;
    const hasVault = Object.values(FEATURES).some((f) => f?.key === 'Vault');
    const hasIntegrity = Object.values(FEATURES).some((f) => f?.key === 'Integrity');
    const hasTenancyEnforcer = typeof base44?.entities?.Course?.filterGlobal === 'function';
    const tenancySummary = getTenancyWarningsSummary();

    return [
      {
        key: 'registry_present',
        label: 'Feature Registry loaded',
        ok: hasRegistry,
        detail: [`FEATURES count: ${Object.keys(FEATURES || {}).length}`]
      },
      {
        key: 'vault_registered',
        label: 'Vault registered',
        ok: hasVault,
        detail: [hasVault ? '✅ Vault is present in registry.' : '❌ Vault missing from registry.']
      },
      {
        key: 'integrity_registered',
        label: 'Integrity registered',
        ok: hasIntegrity,
        detail: [hasIntegrity ? '✅ Integrity is present in registry.' : '❌ Integrity missing from registry.']
      },
      {
        key: 'tenancy_enforcer',
        label: 'Tenancy enforcer installed',
        ok: hasTenancyEnforcer,
        detail: [
          hasTenancyEnforcer
            ? '✅ Runtime tenant guard is active.' 
            : '⚠️ Tenancy enforcer not detected.'
        ]
      },
      {
        key: 'tenancy_runtime_warnings',
        label: 'Runtime tenancy warnings',
        ok: (tenancySummary?.total || 0) === 0,
        detail: (tenancySummary?.total || 0) === 0
          ? ['✅ No tenancy warnings recorded yet.']
          : [
              `⚠️ ${tenancySummary.total} warnings recorded.`,
              'Inspect warnings in the side panel.'
            ]
      },
      {
        key: 'active_school',
        label: 'Active school selected',
        ok: hasActiveSchool,
        detail: [hasActiveSchool ? `activeSchoolId: ${activeSchoolId}` : '⚠️ No activeSchoolId found.']
      },
      {
        key: 'routes_deduped',
        label: 'No duplicate routes',
        ok: registryStats.duplicates.length === 0,
        detail: registryStats.duplicates.length === 0 ? ['✅ No duplicate registry routes found.'] : registryStats.duplicates.map((r) => `⚠️ Duplicate: ${r}`)
      }
    ];
  }, [activeSchoolId, registryStats, tenancyTick]);

  const report = useMemo(() => {
    const now = new Date().toISOString();
    const sections = {
      meta: {
        generated_at: now,
        user_email: user?.email || null,
        role: role || null,
        active_school_id: activeSchoolId || null
      },
      registry: registryStats,
      checks: Object.fromEntries(coreChecks.map((c) => [c.key, c.ok])),
      scans: Object.fromEntries(scans.map((s) => [s.key, s.ok]))
    };
    sections.tenancy_warnings = getTenancyWarningsSummary();
    sections.tenancy_warnings_recent = getTenancyWarnings().slice(0, 50);
    return sections;
  }, [user?.email, role, activeSchoolId, registryStats, coreChecks, scans, tenancyTick]);

  const overallOk = useMemo(() => {
    const all = [...coreChecks, ...scans];
    if (all.length === 0) return false;
    return all.every((c) => c.ok);
  }, [coreChecks, scans]);

  const tenancySummaryLive = useMemo(() => getTenancyWarningsSummary(), [tenancyTick]);
  const tenancyWarningsLive = useMemo(() => getTenancyWarnings().slice(0, 25), [tenancyTick]);

  const copyReport = async () => {
    const text = safeJson(report);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const blob = new Blob([text], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    }
  };

  const downloadReport = () => {
    const text = safeJson(report);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `integrity-report-${new Date().toISOString().slice(0, 19).replaceAll(':', '-')}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  };

  if (isLoading) {
    return (
      <div className={tokens.layout.sectionGap}>
        <div className={cx(tokens.glass.card, "p-8 text-center")}>
          <p className="text-muted-foreground animate-pulse">Loading system diagnostics...</p>
        </div>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className={tokens.layout.sectionGap}>
        <div className={cx(tokens.glass.card, "p-8 text-center bg-destructive/5 border-destructive/20")}>
          <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className={tokens.text.h2}>Access Restricted</h2>
          <p className="text-muted-foreground mt-2">This page is only accessible to school administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={tokens.layout.sectionGap}>
      {/* Header */}
      <div className={cx(tokens.glass.card, "p-8 md:p-12 bg-gradient-to-r from-slate-900 to-slate-800 border-none text-white")}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h1 className={cx(tokens.text.h1, "text-white mb-2")}>System Integrity</h1>
            <p className="text-slate-300 text-lg">
              Diagnostics for tenancy, security, and registry health.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white" onClick={copyReport}>
              <ClipboardCopy className="mr-2 h-4 w-4" /> Copy JSON
            </Button>
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white" onClick={downloadReport}>
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                setSources(null);
                setReloadNonce((n) => n + 1);
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Status Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className={cx(tokens.glass.card, "p-6")}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={tokens.text.h2}>System Status</h2>
              <Badge variant={overallOk ? 'default' : 'destructive'} className="px-3 py-1 text-sm">
                {overallOk ? 'Healthy' : 'Needs Attention'}
              </Badge>
            </div>

            <div className="space-y-4">
              {[...coreChecks, ...scans].map((c) => (
                <div key={c.key} className={cx(
                  "p-4 rounded-xl border transition-all",
                  c.ok ? "bg-card/50 border-border/50" : "bg-amber-50/10 border-amber-500/20"
                )}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5"><StatusIcon ok={c.ok} /></div>
                      <div>
                        <div className="font-medium text-foreground">{c.label}</div>
                        <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                          {(c.detail || []).map((d, idx) => (
                            <div key={idx}>{d}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {sources?.error && (
              <div className="mt-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Source scan error: {sources.error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Side Panels */}
        <div className="space-y-6">
          {/* Registry Stats */}
          <div className={cx(tokens.glass.card, "p-6")}>
            <h3 className={cx(tokens.text.h3, "mb-4")}>Registry Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Features</span>
                <span className="text-lg font-bold">{registryStats.featureCount}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Routes</span>
                <span className="text-lg font-bold">{registryStats.routeCount}</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50/10 border border-blue-200/20 rounded-xl">
              <h4 className="font-semibold text-sm mb-2 text-blue-600 dark:text-blue-400">Guidance</h4>
              <ul className="text-xs space-y-2 text-muted-foreground list-disc pl-4">
                <li>Never inline the feature registry.</li>
                <li>Scope all queries to <code>activeSchoolId</code>.</li>
                <li>Validate before shipping.</li>
              </ul>
            </div>
          </div>

          {/* Runtime Warnings */}
          <div className={cx(tokens.glass.card, "p-6")}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={tokens.text.h3}>Runtime Warnings</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs"
                onClick={() => {
                  clearTenancyWarnings();
                  setTenancyTick((t) => (t + 1) % 1_000_000);
                }}
              >
                Clear
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg mb-4">
              <span className="text-sm font-medium">Total Events</span>
              <span className={cx(
                "text-lg font-bold",
                tenancySummaryLive.total > 0 ? "text-amber-500" : "text-green-500"
              )}>
                {tenancySummaryLive.total}
              </span>
            </div>

            {tenancyWarningsLive.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No warnings recorded.
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {tenancyWarningsLive.map((w) => (
                  <div key={`${w.ts}-${w.type}`} className="text-xs p-3 rounded-lg bg-amber-50/5 border border-amber-500/10">
                    <div className="flex justify-between text-muted-foreground mb-1">
                      <span>{new Date(w.ts).toLocaleTimeString()}</span>
                      <span className="font-mono text-amber-600 dark:text-amber-400">{w.type}</span>
                    </div>
                    {w.detail && (
                      <div className="font-mono bg-black/5 p-1 rounded mt-1 overflow-x-auto">
                        {safeJson(w.detail)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}