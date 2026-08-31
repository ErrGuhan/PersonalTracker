import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LifeSync OS — Main Dashboard",
  description:
    "A futuristic glassmorphism performance OS dashboard synchronizing health, fitness, study, and cognitive goals.",
  keywords: ["LifeSync OS", "performance dashboard", "fitness hub", "health analytics", "glassmorphism"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js" async defer />
      </head>
      <body className={`${inter.className} bg-background text-on-background min-h-screen font-body-md selection:bg-primary/30 relative overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}
