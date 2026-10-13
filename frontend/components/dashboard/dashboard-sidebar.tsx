"use client";
import {
  BookOpen,
  FileClock,
  FilePlus2,
  Files,
  FolderClock,
  FolderGit2,
  KeyRound,
  LayoutDashboard,
  LayoutGrid,
  Link2,
  LucideProps,
  PenTool,
  SquarePen,
  Upload,
} from "lucide-react";
import Link from "next/link";
import React from "react";

import { NavMain } from "@/components/dashboard/nav-mian";
import { Logo } from "@/components/logo";
import { NavUser } from "@/components/navuser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { env } from "@/lib/env";
import { UserFullInfo } from "@/lib/modules/user/user.types";

interface NavItems {
  label: string;
  items: {
    title: string;
    url: string;
    icon: React.ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
    >;
  }[];
}

const navItems: NavItems[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Files",
    items: [
      {
        title: "Files",
        url: "/dashboard/files",
        icon: Files,
      },
      {
        title: "Upload Files",
        url: "/dashboard/file/upload",
        icon: Upload,
      },
      {
        title: "New File",
        url: "/dashboard/file/new",
        icon: FilePlus2,
      },
      {
        title: "Git Clone",
        url: "/dashboard/file/git-clone",
        icon: FolderGit2,
      },
    ],
  },
  {
    label: "Pens",
    items: [
      {
        title: "Pens",
        url: "/dashboard/pens",
        icon: PenTool,
      },
      {
        title: "New Pen",
        url: "/dashboard/pens/edit",
        icon: SquarePen,
      },
    ],
  },
  {
    label: "Tools",
    items: [
      {
        title: "Temp Files",
        url: `${env.NEXT_PUBLIC_SITE_URL}/tmp`,
        icon: FileClock,
      },
      {
        title: "Temp Folders",
        url: `${env.NEXT_PUBLIC_SITE_URL}/tmp/f`,
        icon: FolderClock,
      },
      {
        title: "Shortlinks",
        url: `${env.NEXT_PUBLIC_SITE_URL}/r`,
        icon: Link2,
      },
      {
        title: "Frames",
        url: `${env.NEXT_PUBLIC_SITE_URL}/frames`,
        icon: LayoutGrid,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        title: "API Key",
        url: "/dashboard/api-key",
        icon: KeyRound,
      },
      {
        title: "API Docs",
        url: `${env.NEXT_PUBLIC_BACKEND_API_URL}/docs`,
        icon: BookOpen,
      },
    ],
  },
];

export const DashboardSidebar = ({
  user,
  ...props
}: { user: UserFullInfo | null } & React.ComponentProps<typeof Sidebar>) => {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              href={env.NEXT_PUBLIC_SITE_URL}
              className="flex items-center bg-muted/15 hover:bg-muted/20 rounded gap-3 p-2"
            >
              <Logo />
              <span className="text-base font-semibold">
                {env.NEXT_PUBLIC_SITE_NAME}
              </span>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu />
        {navItems.map((nav, idx) => (
          <NavMain key={idx} label={nav.label} items={nav.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
};
