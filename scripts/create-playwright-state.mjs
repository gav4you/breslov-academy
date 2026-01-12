import fs from 'node:fs';
import path from 'node:path';

const outPath = process.env.PLAYWRIGHT_STATE_PATH || 'tests/.auth/storageState.json';
const origin = process.env.PLAYWRIGHT_STATE_ORIGIN || 'http://localhost:5173';
const token = process.env.PLAYWRIGHT_STATE_TOKEN || 'dev';

const storageState = {
  cookies: [],
  origins: [
    {
      origin,
      localStorage: [
        { name: 'breslov_session_token', value: token },
      ],
    },
  ],
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(storageState, null, 2));
console.log(`Playwright storage state written to ${outPath}`);
