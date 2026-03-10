// Electron main process: starts an embedded Next.js production server
// and creates the application window.

import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import { createServer } from 'http';
import { readFileSync } from 'fs';

const isDev = !app.isPackaged;
const isMac = process.platform === 'darwin';
const PORT = 3456;

let mainWindow: BrowserWindow | null = null;

/** Load .env.production into process.env for the packaged app. */
function loadEnv(): void {
  if (isDev) return; // In dev, Next.js reads .env.local automatically

  const envPath = path.join(app.getAppPath(), '.env.production');
  try {
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex);
      const value = trimmed.slice(eqIndex + 1);
      process.env[key] = value;
    }
  } catch {
    // No .env.production — rely on build-time inlined values
  }
}

async function startNextServer(): Promise<void> {
  // Both dev and packaged: app root is one level up from dist-electron/.
  // In dev, that's .electron-staging/. In packaged, app.getAppPath().
  const appDir = isDev ? path.join(__dirname, '..') : app.getAppPath();

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const next = require('next');
  const nextApp = next({ dev: false, dir: appDir, quiet: true });
  const handler = nextApp.getRequestHandler();

  await nextApp.prepare();

  const server = createServer((req, res) => {
    handler(req, res);
  });

  return new Promise((resolve) => {
    server.listen(PORT, '127.0.0.1', () => {
      resolve();
    });
  });
}

function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'Burbbon',
    // macOS: hidden inset titlebar with custom traffic light position.
    // Windows: hidden titlebar with native window controls overlay.
    ...(isMac
      ? {
          titleBarStyle: 'hiddenInset' as const,
          trafficLightPosition: { x: 12, y: 14 },
        }
      : {
          titleBarStyle: 'hidden' as const,
          titleBarOverlay: {
            height: 48,
            color: '#ffffff',
            symbolColor: '#000000',
          },
        }),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(`http://127.0.0.1:${PORT}`);

  // Open external links in the system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  loadEnv();
  await startNextServer();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
