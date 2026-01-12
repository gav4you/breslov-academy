import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const featurePath = path.join(root, 'src', 'components', 'config', 'features.jsx');
const outputPath = path.join(root, 'docs', 'V9_FEATURE_REGISTRY_DUMP.md');

const content = fs.readFileSync(featurePath, 'utf8');
const lines = content.split(/\r?\n/);

const entries = [];

const getString = (line, prop) => {
  const match = line.match(new RegExp(`${prop}:\\s*'([^']*)'`));
  return match ? match[1] : '';
};

const getBoolean = (line, prop) => {
  const match = line.match(new RegExp(`${prop}:\\s*(true|false)`));
  return match ? match[1] : '';
};

const getArray = (line, prop) => {
  const match = line.match(new RegExp(`${prop}:\\s*\\[([^\\]]*)\\]`));
  if (!match) return '';
  return match[1]
    .split(',')
    .map((value) => value.replace(/['"]/g, '').trim())
    .filter(Boolean)
    .join(', ');
};

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('//')) continue;
  if (!trimmed.includes('key:')) continue;
  if (!trimmed.includes('route:')) continue;

  const entryMatch = trimmed.match(/^([A-Za-z0-9_]+):\s*{.*}\s*,?\s*$/);
  if (!entryMatch) continue;

  const registryId = entryMatch[1];
  const key = getString(trimmed, 'key');
  const label = getString(trimmed, 'label');
  const route = getString(trimmed, 'route');
  const area = getString(trimmed, 'area');
  const audiences = getArray(trimmed, 'audiences');
  const flagKey = getString(trimmed, 'flagKey');
  const hidden = getBoolean(trimmed, 'hidden');
  const vaultOnly = getBoolean(trimmed, 'vaultOnly');

  entries.push({
    registryId,
    key,
    label,
    route,
    area,
    audiences,
    flagKey,
    hidden,
    vaultOnly,
  });
}

const now = new Date().toISOString();
const rows = entries.map((entry) => [
  entry.registryId || '',
  entry.key || '',
  entry.label || '',
  entry.route || '',
  entry.area || '',
  entry.audiences || '',
  entry.flagKey || '',
  entry.hidden || '',
  entry.vaultOnly || '',
]);

const header = [
  'Registry ID',
  'Feature Key',
  'Label',
  'Route',
  'Area',
  'Audiences',
  'Flag Key',
  'Hidden',
  'Vault Only',
];

const tableLines = [
  `# Feature Registry Dump (v9)`,
  ``,
  `Generated from \`${path.relative(root, featurePath)}\` on ${now}.`,
  ``,
  `| ${header.join(' | ')} |`,
  `| ${header.map(() => '---').join(' | ')} |`,
  ...rows.map((row) => `| ${row.map((cell) => cell || '-').join(' | ')} |`),
  ``,
  `Notes:`,
  `- Update \`${path.relative(root, featurePath)}\` to change registry data.`,
  `- Re-run \`node scripts/dump-feature-registry.mjs\` after registry edits.`,
];

fs.writeFileSync(outputPath, `${tableLines.join('\n')}\n`, 'utf8');
console.log(`Wrote ${path.relative(root, outputPath)} (${rows.length} entries).`);
