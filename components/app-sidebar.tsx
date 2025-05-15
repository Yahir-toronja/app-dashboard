// components/app-sidebar.tsx
"use client"
 
import * as React from "react"
import {
  BookOpen,
  Building2,
  User,
  Users,
  Clock8,
  LifeBuoy,
  Send,
  Cherry,
  BookOpenCheck,
} from "lucide-react"
import { NavMain } from "@/components/nav-main"
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
import Link from "next/link"
import { Button } from "./ui/button"
 
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: "Maestros",
        url: "/maestros",
        icon: Users,
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
        title: "Estudiantes",
        url: "/estudiantes",
        icon: User,
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
        title: "Horarios",
        url: "/horarios",
        icon: Clock8,
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
      {
        title: "Salones",
        url: "/salones",
        icon: Building2,
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
        title: "Calificaciones",
        url: "/calificaciones",
        icon: BookOpenCheck,
        items: [
          {
            title: "Ver",
            url: "/calificaciones",
          },
          {
            title: "Crear",
            url: "/calificaciones/create",
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
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <Button className="flex size-8 items-center justify-center rounded-lg cursor-pointer" >
                  <Cherry className="size-4" />
                </Button>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Mi Escuela</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </Link>
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