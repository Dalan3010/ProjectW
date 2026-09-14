// BID — Autenticación local simulada (localStorage + Web Crypto)

const BIDAuth = (() => {
  const USERS_KEY = "users";
  const SESSION_KEY = "session";

  async function hashPassword(password, email) {
    const input = `${email.toLowerCase()}:${password}`;
    if (window.crypto && crypto.subtle) {
      const data = new TextEncoder().encode(input);
      const digest = await crypto.subtle.digest("SHA-256", data);
      return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    }
    let hash = 0;
    for (let i = 0; i < input.length; i += 1) {
      hash = (hash * 31 + input.charCodeAt(i)) | 0;
    }
    return `fnv-${Math.abs(hash).toString(16)}`;
  }

  function getUsers() {
    return BIDStorage.get(USERS_KEY, {});
  }

  function saveUsers(users) {
    return BIDStorage.set(USERS_KEY, users);
  }

  function startSession(email, name, isDemo) {
    const session = {
      email,
      name,
      isDemo,
      loginAt: new Date().toISOString(),
    };
    BIDStorage.set(SESSION_KEY, session);
    return session;
  }

  async function register({ name, email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    const users = getUsers();
    if (users[normalizedEmail]) {
      throw new Error("Ya existe una cuenta con ese correo.");
    }
    const passwordHash = await hashPassword(password, normalizedEmail);
    users[normalizedEmail] = {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    saveUsers(users);
    return startSession(normalizedEmail, users[normalizedEmail].name, false);
  }

  async function login(email, password) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = getUsers()[normalizedEmail];
    if (!user) {
      throw new Error("No existe una cuenta con ese correo.");
    }
    const passwordHash = await hashPassword(password, normalizedEmail);
    if (passwordHash !== user.passwordHash) {
      throw new Error("Contraseña incorrecta.");
    }
    return startSession(normalizedEmail, user.name, false);
  }

  function loginDemo() {
    return startSession("demo@bid.app", "Demo", true);
  }

  function logout() {
    BIDStorage.remove(SESSION_KEY);
  }

  function currentUser() {
    return BIDStorage.get(SESSION_KEY, null);
  }

  function isAuthenticated() {
    return Boolean(currentUser());
  }

  return { register, login, loginDemo, logout, currentUser, isAuthenticated };
})();