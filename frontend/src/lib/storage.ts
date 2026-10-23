// BID — localStorage access with defensive fallbacks.
// If storage is unavailable (private mode, quota, corrupt JSON) the app keeps
// working with default values instead of crashing.

export class StorageService {
  private readonly prefix: string

  constructor(prefix = 'bid.') {
    this.prefix = prefix
  }

  private key(name: string): string {
    return `${this.prefix}${name}`
  }

  get<T>(name: string, fallback: T): T {
    try {
      const raw = window.localStorage.getItem(this.key(name))
      return raw === null ? fallback : (JSON.parse(raw) as T)
    } catch {
      return fallback
    }
  }

  set(name: string, value: unknown): boolean {
    try {
      window.localStorage.setItem(this.key(name), JSON.stringify(value))
      return true
    } catch {
      return false
    }
  }

  remove(name: string): void {
    try {
      window.localStorage.removeItem(this.key(name))
    } catch {
      // Nothing to clean up without storage.
    }
  }
}

export const storage = new StorageService('bid.')
