/**
 * localStorage polyfill for SSR
 * This prevents errors when libraries try to access localStorage during server-side rendering
 */

if (typeof window === "undefined") {
  // Create a simple in-memory storage for SSR
  const storage = new Map<string, string>();

  global.localStorage = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
    clear: () => {
      storage.clear();
    },
    key: (index: number) => {
      const keys = Array.from(storage.keys());
      return keys[index] ?? null;
    },
    get length() {
      return storage.size;
    },
  } as Storage;
}
