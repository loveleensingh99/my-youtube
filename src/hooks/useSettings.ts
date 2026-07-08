"use client";

import { useCallback } from "react";
import { defaultSettings } from "@/lib/defaults";
import { normalizeSettings } from "@/lib/storage";
import { STORAGE_KEYS } from "@/constants/app";
import type { Settings } from "@/types";
import { useLocalStorage } from "./useLocalStorage";

export function useSettings() {
  const { value: settings, setValue, isHydrated } = useLocalStorage<Settings>(
    STORAGE_KEYS.settings,
    defaultSettings,
    normalizeSettings,
  );

  const updateSettings = useCallback(
    (partial: Partial<Settings>) => {
      setValue((prev) => ({ ...prev, ...partial }));
    },
    [setValue],
  );

  const resetSettings = useCallback(() => {
    setValue(defaultSettings);
  }, [setValue]);

  return {
    settings,
    updateSettings,
    resetSettings,
    isHydrated,
  };
}
