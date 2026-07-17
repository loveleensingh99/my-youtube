"use client";

import { useCallback } from "react";
import { defaultSettings } from "@/lib/defaults";
import { normalizeSettings } from "@/lib/storage";
import { STORAGE_KEYS } from "@/constants/app";
import type { Settings } from "@/types";
import { useLocalStorage } from "./useLocalStorage";

function stripMutedKeywords(settings: Settings): Settings {
  return { ...settings, mutedKeywords: [] };
}

export function useSettings() {
  const { value: settings, setValue, isHydrated } = useLocalStorage<Settings>(
    STORAGE_KEYS.settings,
    defaultSettings,
    (value, fallback) => stripMutedKeywords(normalizeSettings(value ?? fallback)),
  );

  const updateSettings = useCallback(
    (partial: Partial<Settings>) => {
      const { mutedKeywords: _ignored, ...rest } = partial;
      if (Object.keys(rest).length === 0) {
        return;
      }

      setValue((prev) => stripMutedKeywords({ ...prev, ...rest }));
    },
    [setValue],
  );

  const resetSettings = useCallback(() => {
    setValue(stripMutedKeywords(defaultSettings));
  }, [setValue]);

  return {
    settings: stripMutedKeywords(settings),
    updateSettings,
    resetSettings,
    isHydrated,
  };
}
