// Guarda o estado inteiro no localStorage.
const KEY = 'feirinha:v1';

export function defaultState() {
  return { version: 1, products: [], orders: [], nextNumber: 1, checkout: null, editing: null };
}

export function createStore(storage) {
  return {
    load() {
      const raw = storage.getItem(KEY);
      if (raw == null) return defaultState();
      try {
        const data = JSON.parse(raw);
        if (!data || data.version !== 1 || !Array.isArray(data.products) || !Array.isArray(data.orders)) {
          throw new Error('formato inesperado');
        }
        return { ...defaultState(), ...data };
      } catch {
        try { storage.setItem(`${KEY}:corrompido:${Date.now()}`, raw); } catch { /* sem espaço: segue */ }
        return defaultState();
      }
    },
    save(state) {
      storage.setItem(KEY, JSON.stringify(state));
    },
  };
}
