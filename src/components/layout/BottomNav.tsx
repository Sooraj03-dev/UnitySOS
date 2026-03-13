"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, Users, Package, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Map", icon: Map, href: "/map" },
  { label: "Nearby", icon: Users, href: "/nearby" },
  { label: "Resources", icon: Package, href: "/resources" },
  { label: "Profile", icon: UserCircle, href: "/profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 nav-shadow glass border-t border-border">
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 h-[68px]">
        {navItems.map(({ label, icon: Icon, href }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-200",
                isActive && "bg-red-50"
              )}>
                <Icon className={cn("w-5 h-5 transition-all", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span className={cn("text-[10px] font-semibold leading-none", isActive && "text-primary")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
