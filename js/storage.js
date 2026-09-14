// BID — Capa de persistencia local (localStorage)

const BIDStorage = (() => {
  const NAMESPACE = "bid.";

  function get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(NAMESPACE + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function set(key, value) {
    try {
      localStorage.setItem(NAMESPACE + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function remove(key) {
    try {
      localStorage.removeItem(NAMESPACE + key);
    } catch {
      // swallowed: removing a missing key is a no-op
    }
  }

  return { get, set, remove };
})();