"use client";

import Image from "next/image";
import { APP_DESCRIPTION, APP_NAME } from "@/constants/app";

export function ProfilePageHeader() {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card/80 via-card/40 to-muted/20 p-5">
      <div className="flex items-center gap-4">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm">
          <Image src="/icon.svg" alt="" width={32} height={32} className="h-8 w-8" />
        </div>
        <div className="min-w-0 space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">{APP_NAME}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{APP_DESCRIPTION}</p>
        </div>
      </div>
    </section>
  );
}
