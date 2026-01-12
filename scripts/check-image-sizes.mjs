import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const maxKb = Number(process.env.MAX_IMAGE_KB || 500);
const maxBytes = maxKb * 1024;
const targets = ['public', path.join('src', 'assets')];
const exts = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']);

const violations = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (!exts.has(ext)) continue;
    const stat = fs.statSync(fullPath);
    if (stat.size > maxBytes) {
      violations.push({
        file: path.relative(root, fullPath),
        sizeKb: Math.round(stat.size / 1024),
      });
    }
  }
}

targets.forEach((target) => walk(path.join(root, target)));

if (violations.length > 0) {
  console.error(`Image budget exceeded (${maxKb} KB):`);
  violations.forEach((v) => {
    console.error(`- ${v.file} (${v.sizeKb} KB)`);
  });
  process.exit(1);
}

console.log(`Image budgets OK (<= ${maxKb} KB).`);
