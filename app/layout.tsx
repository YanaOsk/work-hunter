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
import Analytics from "@/components/Analytics";
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

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://workhunter.co.il";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Work Hunter — הסקאוט האישי שלך למשרות",
    template: "%s | Work Hunter",
  },
  description: "מצא עבודה עם AI — ייעוץ קריירה אישי, שדרוג קורות חיים, וסקאוט משרות חכם. ניסיון חינמי, ללא כרטיס אשראי.",
  keywords: ["חיפוש עבודה", "AI", "קריירה", "ייעוץ תעסוקתי", "קורות חיים", "משרות", "job search", "career advisor"],
  authors: [{ name: "Work Hunter" }],
  creator: "Work Hunter",
  openGraph: {
    type: "website",
    locale: "he_IL",
    url: BASE_URL,
    siteName: "Work Hunter",
    title: "Work Hunter — הסקאוט האישי שלך למשרות",
    description: "מצא עבודה עם AI — ייעוץ קריירה אישי, שדרוג קורות חיים, וסקאוט משרות חכם.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Work Hunter — AI Career Scout",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Work Hunter — הסקאוט האישי שלך למשרות",
    description: "מצא עבודה עם AI — ייעוץ קריירה אישי, שדרוג קורות חיים, וסקאוט משרות חכם.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
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
            __html: `try{if(!localStorage.getItem('wh-theme-v2')){localStorage.setItem('wh-theme','light');localStorage.setItem('wh-theme-v2','1');}if(localStorage.getItem('wh-theme')==='light'){document.documentElement.classList.add('light');}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Analytics />
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
