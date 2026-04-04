"use client";
import React from "react";
import { NavMain } from "@/components/dashboard/nav-mian";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Upload,
  GitBranch,
  Briefcase,
  PenTool,
  PlusSquare,
  Bell,
  Home,
  LogOut,
  Command,
  CirclePlus,
} from "lucide-react";

const navMan = [
  {
    title: "Upload",
    url: "#",
    icon: Upload,
  },
  {
    title: "Git Clone",
    url: "#",
    icon: GitBranch,
  },
];

const navPen = [
  {
    title: "Projects",
    url: "#",
    icon: Briefcase,
  },
  {
    title: "Pens",
    url: "#",
    icon: PenTool,
  },
  {
    title: "New Pen",
    url: "#",
    icon: PlusSquare,
  },
  {
    title: "Notifications",
    url: "#",
    icon: Bell,
  },
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Logout",
    url: "#",
    icon: LogOut,
  },
];
export const DashboardSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <Command className="size-5!" />
                <span className="text-base font-semibold">Dashboard</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
            >
              <CirclePlus />
              <span>New File</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <NavMain label="Files" items={navMan} />
        <NavMain label="Pens" items={navPen} />
      </SidebarContent>
      {/* <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter> */}
    </Sidebar>
  );
};
