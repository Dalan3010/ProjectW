// BID — Cliente HTTP para el backend (n8n webhook).
// Port del apiClient de FronHack (src/api/client.ts) a fetch nativo, sin axios.

import { storage } from '../storage.js';

const BASE_URL = 'http://localhost:5678/webhook';
const TIMEOUT_MS = 30_000;
const TOKEN_KEY = 'token';

export function getToken() {
  return storage.get(TOKEN_KEY, null);
}

export function setToken(token) {
  storage.set(TOKEN_KEY, token);
}

export function clearToken() {
  storage.remove(TOKEN_KEY);
}

// Request genérico: JSON out/in, Bearer token automático, timeout y 401 global.
export async function request(path, { method = 'GET', body, params } = {}) {
  const url = new URL(BASE_URL + path);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    // Abort por timeout o red caída: error de red, no de servidor.
    if (error.name === 'AbortError') {
      throw new Error('El servidor tardó demasiado en responder. Intenta de nuevo.');
    }
    throw new Error('No se pudo conectar con el servidor. Verificá tu conexión.');
  } finally {
    clearTimeout(timer);
  }

  // 401 global: sesión vencida → limpiar token y volver al login.
  if (response.status === 401) {
    clearToken();
    window.location.href = 'login.html';
    throw new Error('Tu sesión expiró. Inicia sesión de nuevo.');
  }

  if (response.status === 204) return null;

  let data = null;
  try {
    data = await response.json();
  } catch {
    // Respuesta sin JSON válido: dejamos data en null.
  }

  if (!response.ok) {
    throw new Error(getApiError(data, response));
  }

  return data;
}

// Extrae un mensaje legible del error, como getApiError de FronHack.
function getApiError(data, response) {
  if (data && typeof data.message === 'string') return data.message;
  return `Error del servidor (${response.status}).`;
}
