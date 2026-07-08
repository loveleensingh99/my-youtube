import { Suspense } from "react";
import { HomePageClient } from "./HomePageClient";
import { HomePageSkeleton } from "@/components/Skeleton";

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageClient />
    </Suspense>
  );
}
