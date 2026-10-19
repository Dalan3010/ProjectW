// BID — Endpoints de autenticación contra el backend.
// Port de FronHack src/api/auth.ts: /auth/login, /auth/register, /auth/logout, /auth/me.

import { request } from './client.js';

export const authApi = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),

  register: (data) => request('/auth/register', { method: 'POST', body: data }),

  logout: () => request('/auth/logout', { method: 'POST' }),

  me: () => request('/auth/me'),
};
