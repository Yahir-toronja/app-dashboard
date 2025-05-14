"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Command,
  LifeBuoy,
  School,
  Send,
  Timer,
  User,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
// import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Estudiantes",
      url: "/estudiantes",
      icon: User,
      isActive: true,
      items: [
        {
          title: "Ver",
          url: "/estudiantes",
        },
        {
          title: "Crear",
          url: "/estudiantes/create",
        },
      ],
    },
    {
      title: "Mestros",
      url: "/maestros",
      icon: Bot,
      items: [
        {
          title: "Ver",
          url: "/maestros",
        },
        {
          title: "Crear",
          url: "/maestros/create",
        },
      ],
    },
    {
      title: "Materias",
      url: "/materias",
      icon: BookOpen,
      items: [
        {
          title: "Ver",
          url: "/materias",
        },
        {
          title: "Crear",
          url: "/materias/create",
        },
      ],
    },
    {
      title: "Salones",
      url: "/salones",
      icon: School,
      items: [
        {
          title: "Ver",
          url: "/salones",
        },
        {
          title: "Crear",
          url: "/salones/create",
        },
      ],
    },
    {
      title: "Horarios",
      url: "/horarios",
      icon: Timer,
      items: [
        {
          title: "Ver",
          url: "/horarios",
        },
        {
          title: "Crear",
          url: "/horarios/create",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  // projects: [
  //   {
  //     name: "Design Engineering",
  //     url: "#",
  //     icon: Frame,
  //   },
  //   {
  //     name: "Sales & Marketing",
  //     url: "#",
  //     icon: PieChart,
  //   },
  //   {
  //     name: "Travel",
  //     url: "#",
  //     icon: Map,
  //   },
  // ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Mi Escuela</span>
                  <span className="truncate text-xs">Sistema</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
