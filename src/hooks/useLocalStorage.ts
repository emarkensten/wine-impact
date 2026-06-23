'use client';

import { useCallback, useRef, useSyncExternalStore } from 'react';

/**
 * localStorage-backed state that is SSR-safe and free of the
 * set-state-in-effect anti-pattern.
 *
 * Uses useSyncExternalStore so the value is read synchronously on the client
 * (no first-paint flash to the default) while still rendering `initialValue`
 * on the server. `setValue` is stable for the hook's lifetime, which avoids
 * the re-render cascade through context consumers.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Cache the parsed value keyed by the raw string so getSnapshot returns a
  // stable reference between renders (required by useSyncExternalStore).
  const cacheRef = useRef<{ raw: string | null; value: T } | null>(null);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const handler = (e: StorageEvent) => {
        if (e.key === key || e.key === null) onStoreChange();
      };
      window.addEventListener('storage', handler);
      return () => window.removeEventListener('storage', handler);
    },
    [key]
  );

  const getSnapshot = useCallback((): T => {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      raw = null;
    }

    if (!cacheRef.current || cacheRef.current.raw !== raw) {
      let value = initialValue;
      if (raw !== null) {
        try {
          value = JSON.parse(raw) as T;
        } catch {
          value = initialValue;
        }
      }
      cacheRef.current = { raw, value };
    }
    return cacheRef.current.value;
  }, [key, initialValue]);

  const storedValue = useSyncExternalStore(subscribe, getSnapshot, () => initialValue);

  // false on the server / during hydration, true once mounted on the client.
  const isLoaded = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const current = getSnapshot();
        const valueToStore = value instanceof Function ? value(current) : value;
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // The native 'storage' event only fires in other tabs, so notify this
        // tab explicitly to re-read the snapshot.
        window.dispatchEvent(new StorageEvent('storage', { key }));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, getSnapshot]
  );

  return [storedValue, setValue, isLoaded] as const;
}
