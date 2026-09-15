// BID — Utilidades compartidas entre páginas (escape, sesión, navbar, enlaces falsos).
// Fuente única de verdad: nada de duplicar estas funciones en los controladores.

import { auth } from './auth.js';

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function timeAgo(iso) {
  const hours = (Date.now() - new Date(iso).getTime()) / 3600000;
  if (hours < 1) return 'Hace un momento';
  if (hours < 24) return `Hace ${Math.round(hours)}h`;
  return `Hace ${Math.round(hours / 24)}d`;
}

// Guardia de acceso: sin sesión, fuera a login (o a la URL que se indique).
export function requireSession(redirectUrl = 'login.html') {
  const session = auth.currentUser();
  if (!session) {
    window.location.href = redirectUrl;
    return null;
  }
  return session;
}

export function renderUserChip(session) {
  const chip = document.querySelector('.user-chip');
  if (!chip) return;

  const firstName = (session.name || '').trim().split(/\s+/)[0];
  const avatarEl = chip.querySelector('.user-avatar');
  const nameEl = chip.querySelector('.user-name');
  const emailEl = chip.querySelector('.user-email');

  if (nameEl) nameEl.textContent = (session.name || '').trim() || 'Demo';
  if (emailEl) emailEl.textContent = session.email;
  if (avatarEl) avatarEl.textContent = (firstName || 'U').charAt(0).toUpperCase();
}

// El botón "Salir" se crea solo si hay sesión: sin sesión no hay nada que cerrar.
export function renderLogoutButton(session) {
  const actions = document.querySelector('.navbar-actions');
  if (!session || !actions || document.getElementById('logout-btn')) return;

  const logout = document.createElement('a');
  logout.href = '#';
  logout.id = 'logout-btn';
  logout.className = 'btn btn-ghost navbar-btn';
  logout.textContent = 'Salir';
  logout.addEventListener('click', (event) => {
    event.preventDefault();
    auth.logout();
    window.location.href = 'login.html';
  });
  actions.appendChild(logout);
}

// Privacidad, Términos, Contacto: enlaces decorativos que no navegan.
export function bindFakeLinks() {
  document.querySelectorAll('[data-fake]').forEach((link) => {
    link.addEventListener('click', (event) => event.preventDefault());
  });
}