// Application sidebar with navigation links and sign-out.
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { FilePlus, History, LogOut, Palette } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useIsElectron } from '@/hooks/useIsElectron';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const STYLE_GUIDE_USER_ID = '9eb63aec-1600-44d9-9489-222fd2b265d5';

export function AppSidebar({
  orgName,
  orgSlug,
  userId,
}: {
  orgName: string;
  orgSlug: string;
  userId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isElectron = useIsElectron();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    {
      label: 'Nova Venda',
      href: `/${orgSlug}/sales/new`,
      icon: FilePlus,
    },
    {
      label: 'Vendas',
      href: `/${orgSlug}/sales`,
      icon: History,
    },
    ...(userId === STYLE_GUIDE_USER_ID
      ? [
          {
            label: 'Style Guide',
            href: `/${orgSlug}/style-guide`,
            icon: Palette,
          },
        ]
      : []),
  ];

  return (
    <Sidebar>
      <SidebarHeader className={`px-4 py-4 ${isElectron ? 'pt-14' : ''}`}>
        <span className="font-bold text-lg">{orgName}</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <a href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} tooltip="Sair">
              <LogOut />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
