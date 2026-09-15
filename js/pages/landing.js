// BID — Navbar de la landing: muestra un saludo y "Salir" si hay sesión,
// o los botones de invitado si no la hay.

import { auth } from '../auth.js';
import { bindFakeLinks } from '../ui.js';

const navGuest = document.getElementById('nav-guest');
const navUser = document.getElementById('nav-user');
const usernameEl = document.getElementById('nav-username');
const logoutBtn = document.getElementById('logout-btn');

const session = auth.currentUser();

if (session && navGuest && navUser) {
  const firstName = (session.name || '').trim().split(/\s+/)[0];
  usernameEl.textContent = `Hola, ${firstName || session.email}`;
  navGuest.classList.add('hidden');
  navUser.classList.remove('hidden');
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    auth.logout();
    window.location.reload();
  });
}

bindFakeLinks();