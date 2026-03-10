// Cross-platform staging script for electron-builder.
// Copies the Next.js standalone build into .electron-staging/, cleans up
// broken symlinks, copies static assets, and strips unnecessary package.json fields.

import { cpSync, rmSync, readFileSync, writeFileSync, readdirSync, lstatSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';

const STAGING = '.electron-staging';

// 1. Clean previous staging
rmSync(STAGING, { recursive: true, force: true });

// 2. Copy standalone build to staging
cpSync('.next/standalone', STAGING, { recursive: true, dereference: false });

// 3. Remove broken symlinks (pnpm standalone output may contain them)
function removeBrokenSymlinks(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    try {
      const stat = lstatSync(fullPath);
      if (stat.isSymbolicLink()) {
        if (!existsSync(fullPath)) {
          unlinkSync(fullPath);
        }
      } else if (stat.isDirectory()) {
        removeBrokenSymlinks(fullPath);
      }
    } catch {
      // Skip inaccessible entries
    }
  }
}
removeBrokenSymlinks(STAGING);

// 4. Copy static assets and config
cpSync('.next/static', join(STAGING, '.next', 'static'), { recursive: true });
cpSync('public', join(STAGING, 'public'), { recursive: true });

if (existsSync('.env.production')) {
  cpSync('.env.production', join(STAGING, '.env.production'));
}
if (existsSync('pnpm-lock.yaml')) {
  cpSync('pnpm-lock.yaml', join(STAGING, 'pnpm-lock.yaml'));
}

// 5. Strip unnecessary fields from staging package.json
const pkgPath = join(STAGING, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
delete pkg.devDependencies;
delete pkg.build;
delete pkg.scripts;
delete pkg['lint-staged'];
delete pkg.pnpm;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

console.log('Electron staging ready:', STAGING);
