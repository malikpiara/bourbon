// Window toolbar components for Electron and web.
// ElectronControls: a full-width fixed drag bar at the top of the window
// with controls nested inside (no-drag must be a DOM child of drag).
// WindowToolbar: web header with sidebar trigger (inside SidebarInset).
'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useIsElectron } from '@/hooks/useIsElectron';

/** Full-width fixed drag bar with controls. Rendered outside SidebarInset. */
export function ElectronControls() {
  const isElectron = useIsElectron();
  const router = useRouter();

  if (!isElectron) return null;

  return (
    <div className="electron-drag fixed top-0 left-0 right-0 h-12 z-50 border-b bg-background">
      <div className="electron-no-drag inline-flex items-center gap-0.5 pl-[100px] pt-[7px]">
        <SidebarTrigger className="h-8 w-8" />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.forward()}
          aria-label="Go forward"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

/** Web-only header with sidebar trigger. Hidden in Electron (controls are in ElectronControls). */
export function WindowToolbar() {
  const isElectron = useIsElectron();

  // Electron: spacer to push content below the fixed toolbar
  if (isElectron) return <div className="h-12" />;

  return (
    <header className="flex h-12 items-center border-b px-4">
      <SidebarTrigger />
    </header>
  );
}
