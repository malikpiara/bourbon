// Minimal preload script. Exposes an isElectron flag to the renderer.

import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
});
