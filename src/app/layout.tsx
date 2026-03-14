import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import OfflineBanner from "@/components/layout/OfflineBanner";
import { AuthProvider } from "@/context/AuthContext";
import { WebRTCProvider } from "@/context/WebRTCContext";
import { AlertToastProvider } from "@/context/AlertToastContext";
import LayoutShell from "@/components/layout/LayoutShell";
import ServiceWorkerRegistration from "@/components/pwa/ServiceWorkerRegistration";
import InstallPrompt from "@/components/pwa/InstallPrompt";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "UnitySOS — Emergency Response",
  description: "Offline-first disaster response app for emergencies",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "UnitySOS",
  },
  icons: {
    apple: "/icon-192x192.png",
  },
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
            <AlertToastProvider>
              <LayoutShell>
                {children}
              </LayoutShell>
              <OfflineBanner />
              <InstallPrompt />
              <ServiceWorkerRegistration />
            </AlertToastProvider>
          </WebRTCProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
