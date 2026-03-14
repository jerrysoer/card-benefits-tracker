export interface StorageAdapter {
  get<T>(key: string, fallback: T): Promise<T>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  keys(): Promise<string[]>;
}

export class LocalStorageAdapter implements StorageAdapter {
  async get<T>(key: string, fallback: T): Promise<T> {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  }

  async keys(): Promise<string[]> {
    if (typeof window === "undefined") return [];
    return Object.keys(localStorage).filter((k) => k.startsWith("cardclock_"));
  }
}

// Swap this one line when Supabase is added in Phase 5
export const storage: StorageAdapter = new LocalStorageAdapter();
