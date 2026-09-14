/* ================================================================
   BID — Sesión: guardia de acceso + navbar de usuario (chats/casos)
   ================================================================ */

(function () {
  'use strict';

  const session = BIDAuth.currentUser();

  if (!session) {
    window.location.href = 'login.html';
    return;
  }

  function renderUserChip() {
    const chip = document.querySelector('.user-chip');
    if (!chip) return;

    const firstName = (session.name || '').trim().split(/\s+/)[0];
    const nameEl = chip.querySelector('.user-name');
    const emailEl = chip.querySelector('.user-email');
    const avatarEl = chip.querySelector('.user-avatar');

    if (nameEl) {
      nameEl.textContent = firstName ? `${firstName} ${(session.name || '').trim().slice(firstName.length)}`.trim() : 'Demo';
    }
    if (emailEl) emailEl.textContent = session.email;
    if (avatarEl) avatarEl.textContent = (firstName || 'U').charAt(0).toUpperCase();
  }

  function renderLogoutButton() {
    const actions = document.querySelector('.navbar-actions');
    if (!actions || document.getElementById('logout-btn')) return;

    const logout = document.createElement('a');
    logout.href = '#';
    logout.id = 'logout-btn';
    logout.className = 'btn btn-ghost navbar-btn';
    logout.textContent = 'Salir';
    logout.addEventListener('click', (event) => {
      event.preventDefault();
      BIDAuth.logout();
      window.location.href = 'login.html';
    });
    actions.appendChild(logout);
  }

  renderUserChip();
  renderLogoutButton();
})();