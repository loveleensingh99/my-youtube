import { Suspense } from "react";
import { HomePageClient } from "./HomePageClient";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading feed...</div>}>
      <HomePageClient />
    </Suspense>
  );
}
