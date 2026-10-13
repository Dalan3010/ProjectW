// BID — Autenticación contra el backend real (n8n webhook).
// Port del authStore de FronHack: login/registro/logout van a /auth/*,
// el token vive en el storage para que el cliente lo adjunte como Bearer.
// Se eliminó el registro local con hash y el modo demo (decisión: puro backend).

import { authApi } from './api/auth.js';
import { setToken, clearToken } from './api/client.js';
import { storage } from './storage.js';

const SESSION_KEY = 'session';

export class AuthService {
  constructor(storage) {
    this.storage = storage;
  }

  // La sesión local guarda solo lo que la UI necesita; el Bearer lo maneja el cliente.
  saveSession(user, accessToken) {
    const session = {
      name: user.name,
      email: user.email,
      accessToken,
      loginAt: new Date().toISOString(),
    };
    this.storage.set(SESSION_KEY, session);
    setToken(accessToken);
    return session;
  }

  async register({ name, email, password }) {
    // Validación de dominio: no confiamos solo en el HTML del formulario.
    if (!name || !name.trim()) throw new Error('Ingresa tu nombre para registrarte.');
    if (!email || !email.trim()) throw new Error('Ingresa un correo electrónico.');
    if (!password) throw new Error('Ingresa una contraseña.');

    const response = await authApi.register({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    });
    return this.saveSession(response.user, response.tokens.accessToken);
  }

  async login(email, password) {
    const response = await authApi.login({
      email: email.trim().toLowerCase(),
      password,
    });
    return this.saveSession(response.user, response.tokens.accessToken);
  }

  logout() {
    // Best-effort: si el backend está caído, la sesión local se cierra igual.
    authApi.logout().catch(() => {});
    this.storage.remove(SESSION_KEY);
    clearToken();
  }

  currentUser() {
    const session = this.storage.get(SESSION_KEY, null);
    // Sesiones antiguas del mock no tienen accessToken: se tratan como cerradas.
    return session && session.accessToken ? session : null;
  }

  isAuthenticated() {
    return Boolean(this.currentUser());
  }
}

export const auth = new AuthService(storage);
