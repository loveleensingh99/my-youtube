"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  Layers3,
  Menu,
  Plus,
  Settings,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { APP_NAME, STORAGE_KEYS } from "@/constants/app";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useFeedContext } from "@/components/FeedProvider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/", label: "Home", icon: Home, shortcut: "G H" },
  { href: "/channels", label: "Manage", icon: Plus, shortcut: "G C" },
  { href: "/settings", label: "Settings", icon: Settings, shortcut: "G S" },
];

function normalizeBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function ChannelAvatar({ name, active }: { name: string; active?: boolean }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <span
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-foreground",
      )}
      aria-hidden
    >
      {initial}
    </span>
  );
}

interface SidebarContentProps {
  collapsed: boolean;
  channelsExpanded: boolean;
  onToggleChannels: () => void;
  onNavigate?: () => void;
  onExpandSidebar?: () => void;
}

function SidebarContent({
  collapsed,
  channelsExpanded,
  onToggleChannels,
  onNavigate,
  onExpandSidebar,
}: SidebarContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { channels, selectedChannel, selectChannel, clearChannelFilter } = useFeedContext();
  const activeChannelId = selectedChannel;

  const handleAllChannels = () => {
    clearChannelFilter();
    onNavigate?.();
    if (pathname !== "/") {
      router.push("/");
    }
  };

  const handleChannelSelect = (channelId: string) => {
    selectChannel(channelId);
    onNavigate?.();
    router.push(`/channel/${channelId}`);
  };

  return (
    <>
      <div className={cn("flex items-center gap-3 px-2 py-1", collapsed && "justify-center px-0")}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Zap className="h-5 w-5" />
        </div>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">{APP_NAME}</p>
            <p className="truncate text-xs text-muted-foreground">Intentional viewing</p>
          </div>
        ) : null}
      </div>

      <nav className="mt-6 space-y-1" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                collapsed ? "justify-center px-2" : "justify-between",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              <span className={cn("flex items-center gap-3", collapsed && "gap-0")}>
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed ? item.label : null}
              </span>
              {!collapsed ? (
                <kbd className="hidden rounded-md border border-border/60 px-1.5 py-0.5 text-[10px] text-muted-foreground lg:inline">
                  {item.shortcut}
                </kbd>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <Separator className="my-4" />

      {collapsed ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="mx-auto"
          onClick={onExpandSidebar}
          aria-label="Expand sidebar to view channels"
          title="Channels"
        >
          <Users className="h-4 w-4" />
        </Button>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <button
            type="button"
            onClick={onToggleChannels}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
            aria-expanded={channelsExpanded}
          >
            <span className="flex items-center gap-2">
              <Layers3 className="h-4 w-4" />
              Your channels
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                {channels.length}
              </span>
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                channelsExpanded ? "rotate-0" : "-rotate-90",
              )}
            />
          </button>

          {channelsExpanded ? (
            <nav
              className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1"
              aria-label="Channel filters"
            >
              <button
                type="button"
                onClick={handleAllChannels}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                  !activeChannelId
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground group-hover:bg-accent group-hover:text-foreground">
                  All
                </span>
                <span className="truncate font-medium">All channels</span>
              </button>

              {channels.map((channel) => {
                const active = activeChannelId === channel.id;

                return (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => handleChannelSelect(channel.id)}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    )}
                    aria-current={active ? "true" : undefined}
                  >
                    <ChannelAvatar name={channel.name} active={active} />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{channel.name}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {channel.category}
                      </span>
                    </span>
                  </button>
                );
              })}

              {channels.length === 0 ? (
                <p className="px-3 py-2 text-xs text-muted-foreground">
                  No channels yet. Use Manage to add one.
                </p>
              ) : null}
            </nav>
          ) : null}
        </div>
      )}
    </>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { value: collapsed, setValue: setCollapsed } = useLocalStorage<boolean>(
    STORAGE_KEYS.sidebarCollapsed,
    false,
    normalizeBoolean,
  );
  const { value: channelsExpanded, setValue: setChannelsExpanded } = useLocalStorage<boolean>(
    STORAGE_KEYS.channelsSectionExpanded,
    true,
    normalizeBoolean,
  );

  const toggleCollapsed = () => {
    setCollapsed((current) => !current);
  };

  const toggleChannels = () => {
    setChannelsExpanded((current) => !current);
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-40 lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation overlay"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border/60 bg-background/95 p-4 backdrop-blur-xl transition-[width,transform] duration-200 lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "w-[4.75rem] lg:w-[4.75rem]" : "w-72",
        )}
      >
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <span className="text-sm font-medium">Navigation</span>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <SidebarContent
          collapsed={collapsed}
          channelsExpanded={channelsExpanded}
          onToggleChannels={toggleChannels}
          onNavigate={() => setMobileOpen(false)}
          onExpandSidebar={() => setCollapsed(false)}
        />

        <div className="mt-auto hidden pt-4 lg:block">
          <Button
            type="button"
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            className={cn("w-full", !collapsed && "justify-start")}
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                Collapse
              </>
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}
