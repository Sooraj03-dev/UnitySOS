import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/layout/TopNav";
import BottomNav from "@/components/layout/BottomNav";
import OfflineBanner from "@/components/layout/OfflineBanner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "UnitySOS — Emergency Response",
  description: "Offline-first disaster response app for emergencies",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ef4444",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[hsl(210,20%,98%)] antialiased">
        <div className="relative min-h-screen flex flex-col">
          <TopNav />
          <main className="flex-1 max-w-lg mx-auto w-full bg-background shadow-2xl shadow-slate-200/50 min-h-[calc(100vh-56px)]">
            {children}
          </main>
          <OfflineBanner />
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
