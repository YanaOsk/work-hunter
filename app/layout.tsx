import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { LanguageProvider } from "@/components/LanguageProvider";
import Providers from "@/components/Providers";
import NavBarWrapper from "@/components/NavBarWrapper";
import ScrollToTop from "@/components/ScrollToTop";
import AdminFab from "@/components/AdminFab";
import TrackingProvider from "@/components/TrackingProvider";
import InactivityLogout from "@/components/InactivityLogout";
import SwipeBack from "@/components/SwipeBack";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Work Hunter — AI Career Scout",
  description: "Your AI-powered personal career scout. Find jobs tailored to your unique profile.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Restore theme before first paint — prevents flash */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `try{if(!localStorage.getItem('wh-theme-v2')){localStorage.setItem('wh-theme','dark');localStorage.setItem('wh-theme-v2','1');}if(localStorage.getItem('wh-theme')==='light'){document.documentElement.classList.add('light');}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <LanguageProvider>
            <TrackingProvider />
            <InactivityLogout />
            <SwipeBack />
            <NavBarWrapper />
            <ScrollToTop />
            <AdminFab />
            {children}
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
