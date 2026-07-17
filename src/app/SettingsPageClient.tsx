"use client";

import { useEffect } from "react";
import { ChannelManager } from "@/components/ChannelManager";
import { DataBackupCard } from "@/components/DataBackupCard";
import { FirebaseAuthCard } from "@/components/FirebaseAuthCard";
import { FirebaseChannelSync } from "@/components/FirebaseChannelSync";
import { Header } from "@/components/Header";
import { PostsChannelManager } from "@/components/PostsChannelManager";
import { ProfilePageHeader } from "@/components/ProfilePageHeader";
import { SettingsForm } from "@/components/SettingsForm";
import { SettingsPageSkeleton } from "@/components/Skeleton";
import { TagManager } from "@/components/TagManager";
import { useFeedContext } from "@/components/FeedProvider";

function scrollToProfileHash() {
  const id = window.location.hash.replace(/^#/, "");
  if (!id) return;

  requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

export function SettingsPageClient() {
  const { settings, updateSettings, resetSettings, refresh, isLoading, settingsHydrated } =
    useFeedContext();

  useEffect(() => {
    if (!settingsHydrated) return;

    scrollToProfileHash();
    window.addEventListener("hashchange", scrollToProfileHash);
    return () => window.removeEventListener("hashchange", scrollToProfileHash);
  }, [settingsHydrated]);

  if (!settingsHydrated) {
    return <SettingsPageSkeleton />;
  }

  return (
    <>
      <Header title="Profile" onRefresh={() => void refresh()} isRefreshing={isLoading} />

      <main className="space-y-6 px-4 py-4">
        <ProfilePageHeader />
        <FirebaseAuthCard />
        <ChannelManager />
        <PostsChannelManager />
        <TagManager />
        <DataBackupCard />
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
