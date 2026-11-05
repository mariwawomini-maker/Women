import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rawApiUrl = process.env.PUBLIC_API_BASE_URL?.trim();
if (!rawApiUrl) throw new Error('Set PUBLIC_API_BASE_URL to your Render HTTPS URL in Cloudflare Pages.');

const apiUrl = new URL(rawApiUrl);
if (apiUrl.protocol !== 'https:' || apiUrl.username || apiUrl.password || (apiUrl.pathname !== '/' && apiUrl.pathname !== '/api')) {
  throw new Error('PUBLIC_API_BASE_URL must be an HTTPS Render origin, with an optional /api path.');
}

execFileSync(process.execPath, [path.join(projectDir, 'node_modules', '@angular', 'cli', 'bin', 'ng.js'), 'build'], { cwd: projectDir, stdio: 'inherit' });
const assetsDir = path.join(projectDir, 'dist', 'she-stands', 'browser', 'assets');
await mkdir(assetsDir, { recursive: true });
await writeFile(path.join(assetsDir, 'site-config.js'), `window.__SHE_STANDS_API_URL__ = ${JSON.stringify(`${apiUrl.origin}/api`)};\n`);
console.log(`Cloudflare Pages build configured for ${apiUrl.origin}/api`);
