"use client";

import { usePathname } from "next/navigation";
import PromoBanner from "./PromoBanner";
import NavBar from "./NavBar";

export default function NavBarWrapper() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return (
    <div className="print:hidden">
      <PromoBanner />
      <NavBar />
    </div>
  );
}
