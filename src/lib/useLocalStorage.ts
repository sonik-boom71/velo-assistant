"use client";

import { useCallback, useEffect, useState } from "react";

type Updater<T> = T | ((prev: T) => T);

/**
 * Single generic localStorage hook used by every module.
 *
 * SSR-safe: on the server and on the very first client render it returns
 * `initialValue` (no `window` access), so server and client markup match.
 * The real persisted value is read inside an effect after mount, which also
 * flips `hydrated` to true. Writes go to both state and localStorage, and a
 * `storage` listener keeps multiple tabs in sync.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): readonly [T, (value: Updater<T>) => void, boolean] {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  // read once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        setValue(JSON.parse(raw) as T);
      }
    } catch (err) {
      console.error(`useLocalStorage: failed to read "${key}"`, err);
    }
    setHydrated(true);
  }, [key]);

  const set = useCallback(
    (next: Updater<T>) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(resolved));
          }
        } catch (err) {
          console.error(`useLocalStorage: failed to write "${key}"`, err);
        }
        return resolved;
      });
    },
    [key],
  );

  // cross-tab sync
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setValue(JSON.parse(e.newValue) as T);
        } catch {
          /* ignore malformed payloads from other tabs */
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  return [value, set, hydrated] as const;
}
