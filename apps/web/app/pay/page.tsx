import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PayRequest } from "./PayRequest";
import styles from "./pay.module.css";

// Payment request pages are personal links: never indexed, never in the sitemap.
// Rendered per request so each load gets its own CSP nonce (proxy.ts).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Monero payment request",
  description: "Pay a Monero payment request from any wallet.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/pay" },
};

export default function PayPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className={styles.wrap}>
        <div className="container">
          <PayRequest />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
