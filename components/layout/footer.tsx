"use client";

/**
 * # Footer
 * Pie de página global con links esenciales, redes sociales y selector de tema.
 */

import Link from "next/link";
import { Instagram, Facebook, Twitter } from "lucide-react";

export function Footer(): React.ReactElement {
  return (
    <footer className="border-t bg-muted/40 backdrop-blur supports-[backdrop-filter]:bg-muted/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-8 sm:flex-row sm:justify-between">
        {/* Brand + navegación rápida */}
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <span className="text-lg font-semibold tracking-wide">
            © {new Date().getFullYear()} Escuela
          </span>
          <nav className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <Link href="/about" className="transition hover:text-foreground">
              Acerca de
            </Link>
            <Link href="/contact" className="transition hover:text-foreground">
              Contacto
            </Link>
            <Link href="/faq" className="transition hover:text-foreground">
              FAQs
            </Link>
            <Link
              href="/privacy"
              className="transition hover:text-foreground"
            >
              Privacidad
            </Link>
          </nav>
        </div>

        {/* Social + theme toggle */}
        <div className="flex items-center gap-4">
        <Link
            href="https://instagram.com/tu‑perfil"
            aria-label="Instagram"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded p-2 transition hover:bg-accent"
          >
            <Instagram className="h-5 w-5" />
          </Link>
          <Link
            href="https://facebook.com/tu‑pagina"
            aria-label="Facebook"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded p-2 transition hover:bg-accent"
          >
            <Facebook className="h-5 w-5" />
          </Link>
          <Link
            href="https://twitter.com/tu‑usuario"
            aria-label="Twitter"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded p-2 transition hover:bg-accent"
          >
            <Twitter className="h-5 w-5" />
          </Link>

        </div>
      </div>
    </footer>
  );
}
