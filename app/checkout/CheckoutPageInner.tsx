"use client";

import { useSearchParams } from "next/navigation";
import CheckoutPage from "@/components/checkout/CheckoutPage";

export default function CheckoutPageInner() {
  const params = useSearchParams();
  const planId = params.get("plan") ?? "free";
  return <CheckoutPage planId={planId} />;
}
