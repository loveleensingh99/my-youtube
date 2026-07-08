"use client";

import { FirebaseChannelSync } from "@/components/FirebaseChannelSync";
import { Header } from "@/components/Header";
import { SettingsForm } from "@/components/SettingsForm";
import { SettingsPageSkeleton } from "@/components/Skeleton";
import { useFeedContext } from "@/components/FeedProvider";

export function SettingsPageClient() {
  const { settings, updateSettings, resetSettings, refresh, isLoading, settingsHydrated } =
    useFeedContext();

  if (!settingsHydrated) {
    return <SettingsPageSkeleton />;
  }

  return (
    <>
      <Header title="You" onRefresh={() => void refresh()} isRefreshing={isLoading} />

      <main className="space-y-6 px-4 py-4">
        <FirebaseChannelSync />
        <SettingsForm
          settings={settings}
          onUpdate={updateSettings}
          onReset={resetSettings}
        />
      </main>
    </>
  );
}
