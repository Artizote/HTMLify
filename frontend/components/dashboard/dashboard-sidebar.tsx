"use client";
import {
  GitBranch,
  Home,
  KeyIcon,
  LucideProps,
  PenTool,
  PlusSquare,
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

const navIems: NavItems[] = [
  {
    label: "Files",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
      },
      {
        title: "Upload Files",
        url: "/dashboard/file/upload",
        icon: Upload,
      },
      {
        title: "Add New File",
        url: "/dashboard/file/new",
        icon: PlusSquare,
      },
      {
        title: "Git Clone",
        url: "/dashboard/file/git-clone",
        icon: GitBranch,
      },
      {
        title: "Temporary File",
        url: "/tmp",
        icon: GitBranch,
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
        icon: PlusSquare,
      },
    ],
  },
  {
    label: "API",
    items: [
      {
        title: "API Key",
        url: "/dashboard/api-key",
        icon: KeyIcon,
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
              href="/"
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
        {navIems.map((nav, idx) => (
          <NavMain key={idx} label={nav.label} items={nav.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
};
