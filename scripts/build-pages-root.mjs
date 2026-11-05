import { execFileSync } from 'node:child_process';
import { cp, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const frontendDir = path.join(rootDir, 'frontend');
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error('Run this build through npm: npm run build:pages');
if (!process.env.PUBLIC_API_BASE_URL?.trim()) {
  throw new Error('Set PUBLIC_API_BASE_URL to your Render HTTPS URL in Cloudflare Pages.');
}

for (const args of [['ci'], ['run', 'build:pages']]) {
  execFileSync(process.execPath, [npmCli, ...args], { cwd: frontendDir, stdio: 'inherit' });
}

const publishDir = path.join(rootDir, 'dist', 'she-stands', 'browser');
await mkdir(publishDir, { recursive: true });
await cp(path.join(frontendDir, 'dist', 'she-stands', 'browser'), publishDir, { recursive: true, force: true });
console.log(`Cloudflare Pages output: ${publishDir}`);
