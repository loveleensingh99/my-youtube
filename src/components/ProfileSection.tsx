"use client";

import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProfileSectionProps {
  id?: string;
  title: string;
  description: string;
  icon: ReactNode;
  count?: number;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ProfileSection({
  id,
  title,
  description,
  icon,
  count,
  action,
  children,
  className,
}: ProfileSectionProps) {
  return (
    <Card
      id={id}
      className={cn("scroll-mt-24 overflow-hidden border-border/60 bg-card/40", className)}
    >
      <CardHeader className="space-y-4 border-b border-border/40 bg-muted/10 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background/80 text-muted-foreground">
              {icon}
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-base">{title}</CardTitle>
                {typeof count === "number" ? (
                  <Badge variant="secondary" className="rounded-full px-2 py-0 text-[11px]">
                    {count}
                  </Badge>
                ) : null}
              </div>
              <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
            </div>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}

interface ProfileEmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function ProfileEmptyState({ title, description, action }: ProfileEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
