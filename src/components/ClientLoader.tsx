"use client";

import dynamic from "next/dynamic";

const CoffeeApp = dynamic(() => import("@/components/CoffeeApp"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
      <div className="text-center text-amber-700">
        <div className="text-5xl mb-3">☕</div>
        <p>A carregar...</p>
      </div>
    </div>
  ),
});

export default function ClientLoader() {
  return <CoffeeApp />;
}
