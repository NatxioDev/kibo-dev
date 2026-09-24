import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
import { ThemeScript } from "@/features/theme/ThemeScript";
import { ThemeToggle } from "@/features/theme/ThemeToggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kibo",
  description: "Gestor personal de gastos",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <ThemeProvider>
          <div className="sticky top-0 z-40 border-b border-zinc-200 bg-background/90 backdrop-blur dark:border-zinc-800">
            <div className="mx-auto flex h-12 w-full max-w-3xl items-center justify-end px-4">
              <ThemeToggle />
            </div>
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
