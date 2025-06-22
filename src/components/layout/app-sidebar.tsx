import React from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavGroup } from '@/components/layout/nav-group'
import { NavUser } from '@/components/layout/nav-user'
import { Logo } from '@/components/layout/logo'
import { sidebarData } from './data/sidebar-data'
import { useAuthStore } from '@/stores/authStore'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user: authUser } = useAuthStore();

  const dynamicUser = {
    name: authUser?.prof_email?.split('@')[0] || 'Usuário',
    email: authUser?.prof_email || 'usuario@exemplo.com',
    avatar: '/avatars/shadcn.jpg',
  };

  const initials = authUser?.prof_email
    ? authUser.prof_email
        .split('@')[0]
        .split('.')
        .map((name: string) => name.charAt(0).toUpperCase())
        .join('')
        .slice(0, 2)
    : 'US';

  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((group) => (
          <NavGroup key={group.title} {...group} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ ...dynamicUser, initials }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
