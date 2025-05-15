"use client"

import { SidebarIcon } from "lucide-react"
import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { SearchForm } from "@/components/search-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
//import { useSidebarStore } from "@/store/sidebarStore"
import { useBreadcrumbStore } from "@/store/breadcrumbStore"
import { ThemeToggle } from "./theme/theme-toggle"
import { useSidebar } from "./ui/sidebar"

export function SiteHeader() {
  //const toggleSidebar = useSidebarStore(state => state.toggleSidebar)
  const {toggleSidebar} = useSidebar()
  const items = useBreadcrumbStore(state => state.items)
  const setBreadcrumb = useBreadcrumbStore(state => state.setBreadcrumb)
  const pathname = usePathname()

  // Actualizar el breadcrumb cuando cambia la ruta
  useEffect(() => {
    setBreadcrumb(pathname)
  }, [pathname, setBreadcrumb])

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            {items.map((item, index) => (
              <BreadcrumbItem key={index}>
                {item.isCurrentPage ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <>
                    <BreadcrumbLink href={item.href || '#'}>
                      {item.label}
                    </BreadcrumbLink>
                    {index < items.length - 1 && <BreadcrumbSeparator />}
                  </>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="justify-end flex-1 sm:flex ">
          <ThemeToggle />
        </div>
        <SearchForm className="w-full sm:ml-auto sm:w-auto" />
      </div>
    </header>
  )
}
