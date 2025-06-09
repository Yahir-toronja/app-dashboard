import { ThemeProvider } from "@/components/theme/theme-provider"
import type { Metadata } from "next";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Footer } from "@/components/layout/footer";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ClerkProvider } from '@clerk/nextjs';
import { neobrutalism } from '@clerk/themes'

export const iframeHeight = "800px"
export const description = "A sidebar with a header and a search form."
export const metadata: Metadata = {
  title: "Mi Escuela",
  description: "WebApp para gestionar mi escuela",
  icons: {
    icon: "/favicon.ico",
  },
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

/**
   * Provides the root layout structure and global providers for the Mi Escuela web application.
   *
   * Wraps the application in authentication, theming, sidebar, and data providers, and renders the main layout including header, sidebar, content area, and footer.
   *
   * @param children - The content to be rendered within the layout.
   * @returns The complete HTML structure for the application's root layout.
   */
  export default function RootLayout({ children }: RootLayoutProps): React.ReactElement {
  return (
    <ClerkProvider
    appearance={{
        baseTheme: neobrutalism ,
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className="min-h-screen bg-background font-sans antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="[--header-height:calc(--spacing(14))]">

              <SidebarProvider className="flex flex-col">
                <SiteHeader />
                <div className="flex flex-1">
                  <AppSidebar />
                  <SidebarInset>
                    <ConvexClientProvider>
                      <div className="flex flex-1 flex-col gap-4 p-4">
                        {children}
                      </div>
                      <Footer />
                    </ConvexClientProvider>
                  </SidebarInset>
                </div>
              </SidebarProvider>
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );}