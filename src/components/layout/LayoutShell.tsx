"use client";

import { usePathname } from "next/navigation";
import TopNav from "@/components/layout/TopNav";
import BottomNav from "@/components/layout/BottomNav";

const AUTH_ROUTES = ["/login", "/admin/login", "/user/login"];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.includes(pathname);

  if (isAuthPage) {
    return (
      <div className="relative min-h-screen flex flex-col">
        <main className="flex-1 max-w-lg mx-auto w-full bg-background shadow-2xl shadow-slate-200/50 min-h-screen">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <TopNav />
      <main className="flex-1 max-w-lg mx-auto w-full bg-background shadow-2xl shadow-slate-200/50 min-h-[calc(100vh-56px)]">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
