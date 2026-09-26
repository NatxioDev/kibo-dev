import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter_Tight } from "next/font/google";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { LiquidLensFilter } from "@/components/ui/LiquidLensFilter";
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

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Kibo",
  description: "Gestor personal de gastos",
  icons: {
    icon: [
      { url: "/brand/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: { url: "/brand/app-icon-180.png", sizes: "180x180" },
  },
  appleWebApp: {
    capable: true,
    title: "Kibo",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3ecd9" },
    { media: "(prefers-color-scheme: dark)", color: "#14120d" },
  ],
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${interTight.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <LiquidLensFilter />
        <div aria-hidden className="app-blobs motion-safe:animate-blobs" />
        <ThemeProvider>
          <MotionProvider>
            <DependencyProvider>
              <AppTopBar />
              {children}
            </DependencyProvider>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
