import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LifeSync OS — Gamified Health & Habit Engine",
    short_name: "LifeSync OS",
    description: "Advanced retention, forgiving streak gamification, and health visualization OS.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B0F17",
    theme_color: "#0F172A",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
