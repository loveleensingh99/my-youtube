"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DatabaseBackup,
  EyeOff,
  Home,
  ListVideo,
  LogOut,
  MessageSquareText,
  Settings2,
  Tags,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AppLogoMark } from "@/components/AppLogoMark";
import { useFirebaseAuthContext } from "@/components/FirebaseAuthProvider";
import { APP_NAME } from "@/constants/app";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SideNavContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const SideNavContext = createContext<SideNavContextValue | null>(null);

export function useSideNav() {
  const value = useContext(SideNavContext);
  if (!value) {
    throw new Error("useSideNav must be used within SideNavProvider");
  }
  return value;
}

type SideNavItem = {
  href: string;
  label: string;
  icon: typeof Home;
  match?: "exact" | "hash";
};

type SideNavGroup = {
  label: string;
  items: SideNavItem[];
};

const sideNavGroups: SideNavGroup[] = [
  {
    label: "Browse",
    items: [
      { href: "/", label: "Home", icon: Home, match: "exact" },
      { href: "/posts", label: "Posts", icon: MessageSquareText, match: "exact" },
      { href: "/channels", label: "Subs", icon: ListVideo, match: "exact" },
    ],
  },
  {
    label: "Manage",
    items: [
      { href: "/settings", label: "Profile", icon: UserRound, match: "exact" },
      {
        href: "/settings#subscriptions",
        label: "Subscriptions",
        icon: ListVideo,
        match: "hash",
      },
      {
        href: "/settings#posts",
        label: "Posts channels",
        icon: MessageSquareText,
        match: "hash",
      },
      { href: "/settings#tags", label: "Tags", icon: Tags, match: "hash" },
    ],
  },
  {
    label: "More",
    items: [
      { href: "/settings#settings", label: "Settings", icon: Settings2, match: "hash" },
      { href: "/settings#keyword-mute", label: "Keyword mute", icon: EyeOff, match: "hash" },
      { href: "/settings#backup", label: "Backup", icon: DatabaseBackup, match: "hash" },
      { href: "/settings#account", label: "Account", icon: UserRound, match: "hash" },
    ],
  },
];

function isItemActive(pathname: string, hash: string, item: SideNavItem) {
  if (item.match === "hash") {
    const [path, itemHash] = item.href.split("#");
    return pathname === path && hash === `#${itemHash}`;
  }

  return pathname === item.href && !hash;
}

export function SideNavProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);
  const value = useMemo(() => ({ open, setOpen, toggle }), [open, toggle]);

  return <SideNavContext.Provider value={value}>{children}</SideNavContext.Provider>;
}

export function SideNav() {
  const pathname = usePathname();
  const { open, setOpen } = useSideNav();
  const { configured, user, signOutUser } = useFirebaseAuthContext();
  const [hash, setHash] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOutUser();
      setOpen(false);
      toast.message("Signed out");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation"
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col border-r border-border bg-background shadow-xl transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!open}
        aria-label="Side navigation"
      >
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex min-w-0 items-center gap-2">
            <AppLogoMark className="h-7 w-7 shrink-0" />
            <p className="truncate text-base font-semibold tracking-tight">{APP_NAME}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-full"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex flex-1 flex-col gap-5 overflow-y-auto p-3">
          {sideNavGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(pathname, hash, item);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-white/10 text-foreground"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.5 : 2} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {configured && user ? (
          <div className="border-t border-white/10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Button
              type="button"
              variant="ghost"
              className="h-auto w-full justify-start gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground"
              onClick={() => void handleSignOut()}
              disabled={signingOut}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              Sign out
            </Button>
          </div>
        ) : null}
      </aside>
    </>
  );
}
