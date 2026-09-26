import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Kibo",
    short_name: "Kibo",
    description: "Gestor personal de gastos",
    start_url: "/",
    scope: "/",
    lang: "es",
    dir: "ltr",
    display: "standalone",
    orientation: "portrait",
    background_color: "#14120d",
    theme_color: "#14120d",
    categories: ["finance"],
    icons: [
      {
        src: "/brand/app-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/app-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/app-icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
