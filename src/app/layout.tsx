import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CafeCounter Pro",
  description: "Gestão de pedidos de café",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  );
}
