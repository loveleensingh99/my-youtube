import { Suspense } from "react";
import { FacebookPageClient } from "./FacebookPageClient";
import { FacebookPageSkeleton } from "@/components/Skeleton";

export default function FacebookPage() {
  return (
    <Suspense fallback={<FacebookPageSkeleton />}>
      <FacebookPageClient />
    </Suspense>
  );
}
