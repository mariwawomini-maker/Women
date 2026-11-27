import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error('Run this build through npm: npm run build:cpanel');

const rawApiUrl = process.env.PUBLIC_API_BASE_URL?.trim() || 'https://women-gt20.onrender.com';
execFileSync(process.execPath, [npmCli, 'run', 'build:pages'], {
  cwd: rootDir,
  stdio: 'inherit',
  env: { ...process.env, PUBLIC_API_BASE_URL: rawApiUrl }
});

const browserDir = path.join(rootDir, 'dist', 'she-stands', 'browser');
const zipPath = path.join(rootDir, 'dist', 'sswomensmuseum-cpanel-public_html.zip');
if (existsSync(zipPath)) await rm(zipPath, { force: true });

if (process.platform === 'win32') {
  // Use tar.exe (built into Windows 10/11) so hidden dotfiles like .htaccess are included in the ZIP
  execFileSync('tar.exe', ['-a', '-cf', zipPath, '-C', browserDir, '.'], { stdio: 'inherit' });
} else {
  execFileSync('zip', ['-r', zipPath, '.'], { cwd: browserDir, stdio: 'inherit' });
}

console.log(`cPanel public_html ZIP ready: ${zipPath}`);
