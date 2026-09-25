import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DependencyProvider } from "@/core/context/dependency/Dependency.provider";
import { AppTopBar } from "@/features/settings/components/AppTopBar";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
import { ThemeScript } from "@/features/theme/ThemeScript";
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
          <DependencyProvider>
            <AppTopBar />
            {children}
          </DependencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
