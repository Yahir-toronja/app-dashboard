"use client"

import { usePathname } from "next/navigation"
import { ChevronRight, LucideIcon } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useSidebarStore } from "@/store/sidebarStore"
import { useEffect } from "react"

type NavItem = {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  items?: {
    title: string
    url: string
  }[]
}

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  const expandedSections = useSidebarStore(state => state.expandedSections)
  const setSectionOpen = useSidebarStore(state => state.setSectionOpen)
  const toggleSection = useSidebarStore(state => state.toggleSection)

  // Actualizar el estado del sidebar cuando cambia la ruta
  useEffect(() => {
    items.forEach(item => {
      const isParentActive = item.url === pathname || pathname.startsWith(item.url + "/")
      // Solo expandir automáticamente si la sección está activa y no tenemos un estado guardado
      if (isParentActive && expandedSections[item.url] === undefined) {
        setSectionOpen(item.url, true)
      }
    })
  }, [pathname, items, expandedSections, setSectionOpen])

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isParentActive =
            item.url === pathname || pathname.startsWith(item.url + "/")
          // Usar el estado persistente para determinar si está abierto
          const isOpen = expandedSections[item.url] !== undefined 
            ? expandedSections[item.url] 
            : isParentActive

          return (
            <Collapsible 
              key={item.title} 
              asChild 
              open={isOpen}
              onOpenChange={(open) => setSectionOpen(item.url, open)}
            >
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={item.title} className={isParentActive ? "text-primary" : ""}>
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>

                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => {
                          const isActive = pathname === subItem.url
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                className={isActive ? "text-primary" : ""}
                              >
                                <a href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}