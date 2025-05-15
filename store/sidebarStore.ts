import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SidebarStore {
  // Estado para controlar si el sidebar está abierto o cerrado
  isOpen: boolean
  // Estado para controlar qué secciones están expandidas
  expandedSections: Record<string, boolean>
  // Función para alternar todo el sidebar
  toggleSidebar: () => void
  // Función para alternar una sección específica
  toggleSection: (key: string) => void
  // Función para establecer el estado de una sección
  setSectionOpen: (key: string, value: boolean) => void
}

export const useSidebarStore = create(
  persist<SidebarStore>(
    (set) => ({
      isOpen: true, // Por defecto el sidebar está abierto
      expandedSections: {},
      toggleSidebar: () => 
        set((state) => ({ 
          isOpen: !state.isOpen 
        })),
      toggleSection: (key) =>
        set((state) => ({
          expandedSections: {
            ...state.expandedSections,
            [key]: !state.expandedSections[key],
          },
        })),
      setSectionOpen: (key: string, isOpen: boolean) =>
        set((state) => ({
          expandedSections: {
            ...state.expandedSections,
            [key]: isOpen,
          },
        })),
    }),
    {
      name: "sidebar-store", // clave para localStorage
    }
  )
)