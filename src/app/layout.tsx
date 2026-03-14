import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import OfflineBanner from "@/components/layout/OfflineBanner";
import { AuthProvider } from "@/context/AuthContext";
import { WebRTCProvider } from "@/context/WebRTCContext";
import LayoutShell from "@/components/layout/LayoutShell";

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
        <AuthProvider>
          <WebRTCProvider>
            <LayoutShell>
              {children}
            </LayoutShell>
            <OfflineBanner />
          </WebRTCProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
