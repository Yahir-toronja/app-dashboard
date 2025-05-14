/**
 * # components/layout/navbar.tsx
 * * Define la barra de navegación principal de la aplicación.
 *   Incluye: logo, controles de tema y navegación.
 */

import { ThemeToggle } from "@/components/theme/theme-toggle";
import Link from "next/link";

const APP_TITLE = "Escuela" as const;

export const Navbar: React.FC = () => {
  return (
    <nav 
      className="sticky top-0 z-50 w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 border-b"
      aria-label="Navegación principal"
    >
      {/* Logo/Título */}
      <Link href="/" className="hover:opacity-80 transition-opacity">
        <h4>{APP_TITLE}</h4>
      </Link>

      {/* Controles */}
      <div className="flex items-center gap-4">
        <ThemeToggle />
      </div>
    </nav>
  );
};