import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import PwaRegister from "@/components/PwaRegister";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { AuthProvider } from "@/context/AuthProvider";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0f131c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "LifeSync OS — Personal Health & Life Tracker",
  description:
    "A futuristic glassmorphism performance OS dashboard synchronizing health, fitness, study, and cognitive goals.",
  keywords: ["LifeSync OS", "PWA", "performance dashboard", "fitness hub", "health analytics", "offline app"],
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LifeSync OS",
  },
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
      <body className="flex flex-col h-[100dvh] w-full overflow-hidden bg-[#0B0F17] text-white antialiased">
        <GoogleAnalytics />
        <ThemeProvider>
          <AuthProvider>
            <PwaRegister />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
