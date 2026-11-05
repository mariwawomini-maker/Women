import { execFileSync } from 'node:child_process';
import { cp, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const frontendDir = path.join(rootDir, 'frontend');
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error('Run this build through npm: npm run build:pages');
const rawApiUrl = process.env.PUBLIC_API_BASE_URL?.trim() || 'https://she-stands-museum.onrender.com';
process.env.PUBLIC_API_BASE_URL = rawApiUrl;

import { existsSync } from 'node:fs';

if (!existsSync(path.join(frontendDir, 'node_modules'))) {
  execFileSync(process.execPath, [npmCli, 'ci'], { cwd: frontendDir, stdio: 'inherit', env: { ...process.env, PUBLIC_API_BASE_URL: rawApiUrl } });
}
execFileSync(process.execPath, [npmCli, 'run', 'build:pages'], { cwd: frontendDir, stdio: 'inherit', env: { ...process.env, PUBLIC_API_BASE_URL: rawApiUrl } });

const publishDir = path.join(rootDir, 'dist', 'she-stands', 'browser');
await mkdir(publishDir, { recursive: true });
await cp(path.join(frontendDir, 'dist', 'she-stands', 'browser'), publishDir, { recursive: true, force: true });
console.log(`Cloudflare Pages output: ${publishDir}`);
