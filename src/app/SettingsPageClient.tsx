"use client";

import { Header } from "@/components/Header";
import { SettingsForm } from "@/components/SettingsForm";
import { useFeedContext } from "@/components/FeedProvider";

export function SettingsPageClient() {
  const {
    settings,
    updateSettings,
    resetSettings,
    clearHistory,
    refresh,
    lastUpdatedLabel,
    isLoading,
  } = useFeedContext();

  return (
    <>
      <Header
        title="Settings"
        onRefresh={() => void refresh()}
        isRefreshing={isLoading}
        lastUpdatedLabel={lastUpdatedLabel}
      />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <SettingsForm
          settings={settings}
          onUpdate={updateSettings}
          onReset={resetSettings}
          onClearHistory={clearHistory}
        />
      </main>
    </>
  );
}
