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

// True after hydration on the client, false during server rendering. Use it
// to gate values that differ between server and client, such as the theme.
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

// A boolean persisted in localStorage. Reads it without a setState-in-effect
// round trip and stays in sync across tabs.
export function useStoredFlag(key: string) {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange);
      return () => window.removeEventListener("storage", onChange);
    },
    () => localStorage.getItem(key) === "true",
    () => false,
  );
}
