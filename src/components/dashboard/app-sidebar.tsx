import type React from 'react'
import { IconHelp, IconInnerShadowTop, IconSearch, IconSettings } from '@tabler/icons-react'
import { FileUser, LayoutTemplate, SquarePen } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { NavOptions } from './nav-options'
import { NavSecondary } from './nav-secondary'
import { NavUser } from './nav-user'

const data = {
  options: [
    {
      title: '我的简历',
      url: '/resume',
      icon: FileUser,
    },
    {
      title: '编辑简历',
      url: '/editor',
      icon: SquarePen,
    },
    {
      title: '简历模板',
      url: '/template',
      icon: LayoutTemplate,
    },
  ],
  navSecondary: [
    {
      title: '设置',
      url: '/settings',
      icon: IconSettings,
    },
    {
      title: '帮助',
      url: '/help',
      icon: IconHelp,
    },
    {
      title: '搜索',
      url: '/search',
      icon: IconSearch,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className='data-[slot=sidebar-menu-button]:!p-1.5'>
              <Link to='/'>
                <IconInnerShadowTop className='!size-5' />
                <span className='text-base font-semibold'>Resume</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavOptions options={data.options} />
        <NavSecondary items={data.navSecondary} className='mt-auto' />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
