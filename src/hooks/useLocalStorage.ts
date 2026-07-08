"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

function subscribeToStorage(key: string, onStoreChange: () => void) {
  const handleScopedChange = (event: Event) => {
    const detail = (event as CustomEvent<{ key?: string }>).detail;
    if (detail?.key === "*" || detail?.key === key) {
      onStoreChange();
    }
  };

  const handleCrossTabChange = (event: StorageEvent) => {
    if (event.key === null || event.key === key) {
      onStoreChange();
    }
  };

  window.addEventListener("focustube:storage", handleScopedChange);
  window.addEventListener("storage", handleCrossTabChange);

  return () => {
    window.removeEventListener("focustube:storage", handleScopedChange);
    window.removeEventListener("storage", handleCrossTabChange);
  };
}

function notifyStorageChange(key: string) {
  window.dispatchEvent(new CustomEvent("focustube:storage", { detail: { key } }));
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  normalize: (value: unknown, fallback: T) => T = (value, fallback) =>
    (value as T) ?? fallback,
) {
  const initialValueRef = useRef(initialValue);
  const cacheRef = useRef<{ raw: string | null; value: T }>({
    raw: null,
    value: initialValue,
  });

  const getSnapshot = useCallback((): T => {
    try {
      const item = window.localStorage.getItem(key);

      if (item === null) {
        if (cacheRef.current.raw === null) {
          return cacheRef.current.value;
        }

        cacheRef.current = { raw: null, value: initialValueRef.current };
        return initialValueRef.current;
      }

      if (cacheRef.current.raw === item) {
        return cacheRef.current.value;
      }

      const parsed = normalize(JSON.parse(item), initialValueRef.current);
      cacheRef.current = { raw: item, value: parsed };
      return parsed;
    } catch {
      return cacheRef.current.value ?? initialValueRef.current;
    }
  }, [key, normalize]);

  const storedValue = useSyncExternalStore(
    (onStoreChange) => subscribeToStorage(key, onStoreChange),
    getSnapshot,
    () => initialValueRef.current,
  );

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      const current = getSnapshot();
      const nextValue = value instanceof Function ? value(current) : value;
      const normalized = normalize(nextValue, initialValueRef.current);
      const serialized = JSON.stringify(normalized);

      if (cacheRef.current.raw === serialized) {
        return;
      }

      try {
        window.localStorage.setItem(key, serialized);
        cacheRef.current = { raw: serialized, value: normalized };
        notifyStorageChange(key);
      } catch {
        cacheRef.current = { raw: null, value: normalized };
      }
    },
    [getSnapshot, key, normalize],
  );

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore storage errors.
    }

    cacheRef.current = { raw: null, value: initialValueRef.current };
    notifyStorageChange(key);
  }, [key]);

  return { value: storedValue, setValue, removeValue, isHydrated: true } as const;
}
