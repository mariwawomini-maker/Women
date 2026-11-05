import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rawApiUrl = process.env.PUBLIC_API_BASE_URL?.trim() || 'https://she-stands-museum.onrender.com';
let apiUrlOrigin = 'https://she-stands-museum.onrender.com';
try {
  const apiUrl = new URL(rawApiUrl);
  apiUrlOrigin = apiUrl.origin;
} catch {
  apiUrlOrigin = 'https://she-stands-museum.onrender.com';
}

const npmCli = process.env.npm_execpath;
if (npmCli) {
  execFileSync(process.execPath, [npmCli, 'run', 'build'], { cwd: projectDir, stdio: 'inherit' });
} else {
  execFileSync('npx', ['ng', 'build'], { cwd: projectDir, stdio: 'inherit', shell: true });
}
const assetsDir = path.join(projectDir, 'dist', 'she-stands', 'browser', 'assets');
await mkdir(assetsDir, { recursive: true });
await writeFile(path.join(assetsDir, 'site-config.js'), `window.__SHE_STANDS_API_URL__ = ${JSON.stringify(`${apiUrlOrigin}/api`)};\n`);
console.log(`Cloudflare Pages build configured for ${apiUrlOrigin}/api`);
