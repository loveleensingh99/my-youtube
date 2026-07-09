"use client";

import { ChannelManager } from "@/components/ChannelManager";
import { FirebaseChannelSync } from "@/components/FirebaseChannelSync";
import { Header } from "@/components/Header";
import { PostsChannelManager } from "@/components/PostsChannelManager";
import { ProfilePageHeader } from "@/components/ProfilePageHeader";
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
      <Header title="Profile" onRefresh={() => void refresh()} isRefreshing={isLoading} />

      <main className="space-y-6 px-4 py-4">
        <ProfilePageHeader />
        <ChannelManager />
        <PostsChannelManager />
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
