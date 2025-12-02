import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "DaCapo Jaarplanner 26/27",
  description: "Jaarplanner voor DaCapo College schooljaar 2026/2027",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className="antialiased">
        <Navigation />
        <main className="min-h-screen pb-12">
          {children}
        </main>
      </body>
    </html>
  );
}
