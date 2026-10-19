"use client";

import { useSyncExternalStore } from "react";

// Matches a CSS media query. The server snapshot assumes desktop, and React
// re-renders with the real value right after hydration.
export function useMediaQuery(query: string, serverValue = true) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

// Phone browsers (iOS Safari, Android Chrome) can't share the screen.
export function useCanShareScreen() {
  return useSyncExternalStore(
    () => () => {},
    () => typeof navigator.mediaDevices?.getDisplayMedia === "function",
    () => false,
  );
}
