import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LanguageProvider } from "@/components/LanguageProvider";
import LanguageToggle from "@/components/LanguageToggle";
import Providers from "@/components/Providers";
import NavBarWrapper from "@/components/NavBarWrapper";
import ScrollToTop from "@/components/ScrollToTop";
import AdminFab from "@/components/AdminFab";
import TrackingProvider from "@/components/TrackingProvider";
import InactivityLogout from "@/components/InactivityLogout";
import SwipeBack from "@/components/SwipeBack";
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Restore theme before first paint — prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('wh-theme');if(t==='light'){document.documentElement.classList.add('light');}else if(!t&&window.innerWidth>=768){document.documentElement.classList.add('light');}}catch(e){}`,
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
            <LanguageToggle />
            {children}
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
