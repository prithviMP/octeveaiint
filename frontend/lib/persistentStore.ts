import { useSyncExternalStore } from "react";

export interface PersistentStore<T> {
  get: () => T;
  set: (next: T | ((previous: T) => T)) => void;
  clear: () => void;
  useValue: () => T;
}

export function createPersistentStore<T>(key: string, initial: T): PersistentStore<T> {
  const listeners = new Set<() => void>();
  let cachedRaw: string | null | undefined;
  let cachedValue: T = initial;

  const read = (): T => {
    if (typeof window === "undefined") return initial;
    const raw = window.localStorage.getItem(key);
    if (raw === cachedRaw) return cachedValue;
    cachedRaw = raw;
    try {
      cachedValue = raw === null ? initial : { ...initial, ...JSON.parse(raw) };
    } catch {
      cachedValue = initial;
    }
    return cachedValue;
  };

  const notify = () => listeners.forEach((listener) => listener());

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key === key) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  };

  return {
    get: read,
    set(next) {
      const value = typeof next === "function" ? (next as (previous: T) => T)(read()) : next;
      window.localStorage.setItem(key, JSON.stringify(value));
      notify();
    },
    clear() {
      window.localStorage.removeItem(key);
      notify();
    },
    useValue: () => useSyncExternalStore(subscribe, read, () => initial),
  };
}

const noopSubscribe = () => () => {};

/** False during server render and hydration, true once the client has taken over. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
