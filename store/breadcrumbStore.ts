// // store/breadcrumbStore.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface BreadcrumbItem {
  label: string
  href?: string
  isCurrentPage?: boolean
}

interface BreadcrumbStore {
  items: BreadcrumbItem[]
  setItems: (items: BreadcrumbItem[]) => void
  // Función para configurar el breadcrumb basado en una ruta
  setBreadcrumb: (path: string) => void
}

// Mapa de rutas para configurar el breadcrumb basado en la ruta actual
const routeMap: Record<string, BreadcrumbItem[]> = {
  '/': [
    { label: 'Inicio', href: '/', isCurrentPage: true }
  ],
  '/maestros': [
    { label: 'Inicio', href: '/' },
    { label: 'Maestros', href: '/maestros', isCurrentPage: true }
  ],
  '/maestros/create': [
    { label: 'Inicio', href: '/' },
    { label: 'Maestros', href: '/maestros' },
    { label: 'Crear', isCurrentPage: true }
  ],
  '/estudiantes': [
    { label: 'Inicio', href: '/' },
    { label: 'Estudiantes', href: '/estudiantes', isCurrentPage: true }
  ],
  '/estudiantes/create': [
    { label: 'Inicio', href: '/' },
    { label: 'Estudiantes', href: '/estudiantes' },
    { label: 'Crear', isCurrentPage: true }
  ],
  '/materias': [
    { label: 'Inicio', href: '/' },
    { label: 'Materias', href: '/materias', isCurrentPage: true }
  ],
  '/materias/create': [
    { label: 'Inicio', href: '/' },
    { label: 'Materias', href: '/materias' },
    { label: 'Crear', isCurrentPage: true }
  ],
  '/horarios': [
    { label: 'Inicio', href: '/' },
    { label: 'Horarios', href: '/horarios', isCurrentPage: true }
  ],
  '/horarios/create': [
    { label: 'Inicio', href: '/' },
    { label: 'Horarios', href: '/horarios' },
    { label: 'Crear', isCurrentPage: true }
  ],
  '/salones': [
    { label: 'Inicio', href: '/' },
    { label: 'Salones', href: '/salones', isCurrentPage: true }
  ],
  '/salones/create': [
    { label: 'Inicio', href: '/' },
    { label: 'Salones', href: '/salones' },
    { label: 'Crear', isCurrentPage: true }
  ],
  '/calificaciones': [
    { label: 'Inicio', href: '/' },
    { label: 'Calificaciones', href: '/calificaciones', isCurrentPage: true }
  ],
  '/calificaciones/create': [
    { label: 'Inicio', href: '/' },
    { label: 'Calificaciones', href: '/calificaciones' },
    { label: 'Crear', isCurrentPage: true }
  ]
}

export const useBreadcrumbStore = create(
  persist<BreadcrumbStore>(
    (set) => ({
      items: [{ label: 'Inicio', href: '/', isCurrentPage: true }],
      setItems: (items) => set({ items }),
      setBreadcrumb: (path) => {
        // Si la ruta existe en el mapa, establecemos esos items
        if (routeMap[path]) {
          set({ items: routeMap[path] })
        } else {
          // Si no existe, creamos un breadcrumb básico
          const pathSegments = path.split('/').filter(Boolean)
          const breadcrumbItems: BreadcrumbItem[] = [
            { label: 'Inicio', href: '/' }
          ]
          
          let currentPath = ''
          pathSegments.forEach((segment, index) => {
            currentPath += `/${segment}`
            const isLast = index === pathSegments.length - 1
            breadcrumbItems.push({
              label: segment.charAt(0).toUpperCase() + segment.slice(1),
              href: isLast ? undefined : currentPath,
              isCurrentPage: isLast
            })
          })
          
          set({ items: breadcrumbItems })
        }
      }
    }),
    {
      name: "breadcrumb-store", // clave para localStorage
    }
  )
)