import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LanguageProvider } from "@/components/LanguageProvider";
import LanguageToggle from "@/components/LanguageToggle";
import Providers from "@/components/Providers";
import NavBarWrapper from "@/components/NavBarWrapper";
import ScrollToTop from "@/components/ScrollToTop";
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
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <LanguageProvider>
            <NavBarWrapper />
            <ScrollToTop />
            <LanguageToggle />
            {children}
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
