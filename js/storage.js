// BID — Capa de persistencia sobre localStorage, con fallback defensivo.
// Todo pasa por acá: si el almacenamiento falla (modo privado, cuota llena,
// JSON corrupto), la app sigue funcionando con valores por defecto.

export class StorageService {
  constructor(prefix = 'bid.') {
    this.prefix = prefix;
  }

  key(name) {
    return `${this.prefix}${name}`;
  }

  get(name, fallback = null) {
    try {
      const raw = window.localStorage.getItem(this.key(name));
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      // JSON inválido o almacenamiento bloqueado: devolvemos el fallback.
      return fallback;
    }
  }

  set(name, value) {
    try {
      window.localStorage.setItem(this.key(name), JSON.stringify(value));
      return true;
    } catch {
      // Cuota llena o modo privado: avisamos, pero no rompemos la app.
      return false;
    }
  }

  remove(name) {
    try {
      window.localStorage.removeItem(this.key(name));
    } catch {
      // Sin almacenamiento no hay nada que limpiar.
    }
  }
}

export const storage = new StorageService('bid.');