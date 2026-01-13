import fs from 'node:fs';
import path from 'node:path';

/**
 * post-build.mjs
 * Handles tasks after Vite build completes.
 * 1. Copies index.html to 404.html for SPA support on static hosts.
 */

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const INDEX_PATH = path.join(DIST_DIR, 'index.html');
const NOT_FOUND_PATH = path.join(DIST_DIR, '404.html');

async function run() {
  console.log('[post-build] Starting post-build tasks...');

  if (!fs.existsSync(INDEX_PATH)) {
    console.error(`[post-build] Error: index.html not found at ${INDEX_PATH}`);
    process.exit(1);
  }

  try {
    fs.copyFileSync(INDEX_PATH, NOT_FOUND_PATH);
    console.log(`[post-build] Successfully copied index.html to 404.html`);
  } catch (err) {
    console.error(`[post-build] Failed to copy 404.html: ${err.message}`);
    process.exit(1);
  }

  console.log('[post-build] All tasks complete.');
}

run();
