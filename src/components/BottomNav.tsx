"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListVideo, Newspaper, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/channels", label: "Subs", icon: ListVideo },
  { href: "/facebook", label: "Facebook", icon: Newspaper },
  { href: "/settings", label: "You", icon: UserRound },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-14 max-w-lg items-stretch justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 text-[9px] font-medium transition-colors",
                active ? "text-foreground" : "text-muted-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className={cn("h-5 w-5", active && "fill-current")} strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
