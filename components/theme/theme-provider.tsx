/**
 * # components/theme/theme-provider.tsx
 * * Define el proveedor de temas para la aplicación.
 *   Proporciona funcionalidad de temas (claro/oscuro) usando next-themes.
 */

"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}