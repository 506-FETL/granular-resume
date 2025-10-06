'use client'

import type { LucideIcon } from 'lucide-react'

import { Link } from 'react-router-dom'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function NavOptions({
  description = 'Options',
  options,
}: {
  description?: string
  options: {
    title: string
    url: string
    icon: LucideIcon
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{description}</SidebarGroupLabel>
      <SidebarMenu>
        {options.map(item => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild>
              <Link to={item.url}>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
