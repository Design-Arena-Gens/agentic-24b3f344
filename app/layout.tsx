import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Web Scraping Agent",
  description: "Intelligent web scraping agent",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
