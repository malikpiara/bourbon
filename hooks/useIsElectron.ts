// Detects whether the app is running inside Electron via the preload-exposed flag.
import { useSyncExternalStore } from 'react';

declare global {
  interface Window {
    electronAPI?: { isElectron: boolean };
  }
}

function subscribe() {
  // Value never changes after page load — no-op unsubscribe.
  return () => {};
}

function getSnapshot(): boolean {
  return !!window.electronAPI?.isElectron;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useIsElectron(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
