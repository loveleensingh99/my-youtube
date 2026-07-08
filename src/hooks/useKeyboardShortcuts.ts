"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useKeyboardShortcuts(onRefresh: () => void) {
  const router = useRouter();

  useEffect(() => {
    let awaitingG = false;
    let gTimeout: number | undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable;

      if (isTyping) return;

      if (event.key.toLowerCase() === "r" && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        onRefresh();
        return;
      }

      if (event.key.toLowerCase() === "g") {
        awaitingG = true;
        window.clearTimeout(gTimeout);
        gTimeout = window.setTimeout(() => {
          awaitingG = false;
        }, 1000);
        return;
      }

      if (awaitingG) {
        awaitingG = false;
        window.clearTimeout(gTimeout);

        switch (event.key.toLowerCase()) {
          case "h":
            event.preventDefault();
            router.push("/");
            break;
          case "c":
            event.preventDefault();
            router.push("/channels");
            break;
          case "s":
            event.preventDefault();
            router.push("/settings");
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(gTimeout);
    };
  }, [onRefresh, router]);
}
