"use client";

import { Header } from "@/components/Header";
import { SettingsForm } from "@/components/SettingsForm";
import { useFeedContext } from "@/components/FeedProvider";

export function SettingsPageClient() {
  const { settings, updateSettings, resetSettings, clearHistory, refresh, isLoading } =
    useFeedContext();

  return (
    <>
      <Header title="You" onRefresh={() => void refresh()} isRefreshing={isLoading} />

      <main className="px-4 py-4">
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
