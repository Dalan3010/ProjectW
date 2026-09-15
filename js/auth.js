// BID — Autenticación simulada sobre localStorage (sin backend).

import { storage } from './storage.js';

const USERS_KEY = 'users';
const SESSION_KEY = 'session';

// El email en minúsculas actúa de sal implícita: se hashea "<email>:<password>".
function fnv1aHex(input) {
  // FNV-1a de 32 bits con multiplicador 31 sobre charCodes.
  // El prefijo "fnv-" distingue estos hashes de los SHA-256.
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return `fnv-${Math.abs(hash).toString(16)}`;
}

async function sha256Hex(input) {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function canHashWithWebCrypto() {
  return Boolean(window.crypto && crypto.subtle);
}

async function hashPassword(password, email) {
  const input = `${email.toLowerCase()}:${password}`;
  if (canHashWithWebCrypto()) return sha256Hex(input);
  return fnv1aHex(input);
}

// Reproduce el algoritmo del hash guardado: si alguien se registró sin Web
// Crypto (FNV), el login no debe romperse cuando el entorno ahora sí lo tiene.
async function hashFor(storedHash, password, email) {
  const input = `${email.toLowerCase()}:${password}`;
  if (storedHash && storedHash.startsWith('fnv-')) return fnv1aHex(input);
  return canHashWithWebCrypto() ? sha256Hex(input) : fnv1aHex(input);
}

export class AuthService {
  constructor(storage) {
    this.storage = storage;
  }

  getUser(email) {
    return this.storage.get(USERS_KEY, {})[email] || null;
  }

  saveUser(user) {
    const users = this.storage.get(USERS_KEY, {});
    users[user.email] = user;
    this.storage.set(USERS_KEY, users);
  }

  startSession(email, name, isDemo) {
    const session = { email, name, isDemo, loginAt: new Date().toISOString() };
    this.storage.set(SESSION_KEY, session);
    return session;
  }

  async register({ name, email, password }) {
    // Validación de dominio: no confiamos solo en el HTML del formulario.
    if (!name || !name.trim()) throw new Error('Ingresa tu nombre para registrarte.');
    if (!email || !email.trim()) throw new Error('Ingresa un correo electrónico.');
    if (!password) throw new Error('Ingresa una contraseña.');

    const normalizedEmail = email.trim().toLowerCase();
    if (this.getUser(normalizedEmail)) {
      throw new Error('Ya existe una cuenta con ese correo.');
    }

    const user = {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: await hashPassword(password, normalizedEmail),
      createdAt: new Date().toISOString(),
    };
    this.saveUser(user);

    // Auto-login: registrarse deja la sesión abierta de una.
    return this.startSession(normalizedEmail, user.name, false);
  }

  async login(email, password) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = this.getUser(normalizedEmail);
    if (!user) throw new Error('No existe una cuenta con ese correo.');

    const passwordHash = await hashFor(user.passwordHash, password, normalizedEmail);
    if (passwordHash !== user.passwordHash) throw new Error('Contraseña incorrecta.');

    return this.startSession(normalizedEmail, user.name, false);
  }

  loginDemo() {
    // Cuenta fija sin contraseña: la demo no crea usuarios en el store.
    return this.startSession('demo@bid.app', 'Demo', true);
  }

  logout() {
    this.storage.remove(SESSION_KEY);
  }

  currentUser() {
    return this.storage.get(SESSION_KEY, null);
  }

  isAuthenticated() {
    return Boolean(this.currentUser());
  }
}

export const auth = new AuthService(storage);