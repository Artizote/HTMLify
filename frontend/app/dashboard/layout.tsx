import { DasshboardNavbar } from '@/components/dashboard/dashbaord-navbar'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import {  SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <DashboardSidebar variant='inset' />  
      <SidebarInset>
        <DasshboardNavbar />
      {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
