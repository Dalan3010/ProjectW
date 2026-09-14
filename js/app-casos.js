/* ================================================================
   BID — Casos: grid con datos reales (chats del usuario)
   ================================================================ */

(function () {
  'use strict';

  const session = BIDAuth.currentUser();
  if (!session) {
    window.location.href = 'login.html';
    return;
  }
  const userEmail = session.email;

  const summaryLength = 150;

  // ---------- Utilidades ----------
  function timeAgo(iso) {
    const hours = (Date.now() - new Date(iso).getTime()) / 3600000;
    if (hours < 1) return 'Hace un momento';
    if (hours < 24) return `Hace ${Math.round(hours)}h`;
    return `Hace ${Math.round(hours / 24)}d`;
  }

  function summaryFor(chat) {
    const first = chat.messages.find(m => m.role === 'user');
    if (!first) return 'Todavía no hay mensajes. Abrí este caso para empezar la conversación.';
    const text = first.content.trim();
    return text.length > summaryLength ? `${text.slice(0, summaryLength)}…` : text;
  }

  function chatToCase(chat) {
    return {
      id: chat.id,
      title: chat.title,
      summary: summaryFor(chat),
      messageCount: chat.messages.length,
      updatedAt: chat.updatedAt,
    };
  }

  // ---------- Render ----------
  function renderCards(cases) {
    const grid = document.getElementById('casos-grid');
    const countEl = document.getElementById('casos-count');

    if (!cases.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <p><strong>No se encontraron casos</strong></p>
          <p>Probá con otro término de búsqueda.</p>
        </div>`;
      countEl.textContent = '0 casos · Ordenados por actividad reciente';
      return;
    }

    countEl.textContent = `${cases.length} caso${cases.length !== 1 ? 's' : ''} · Ordenados por actividad reciente`;

    grid.innerHTML = cases.map((c, i) => `
      <a href="chat.html?caso=${encodeURIComponent(c.id)}" class="case-card stagger-item" style="animation-delay:${i * 0.06}s">
        <h3 class="case-title">${escapeHtml(c.title)}</h3>
        <p class="case-summary">${escapeHtml(c.summary)}</p>
        <div class="case-footer">
          <span class="msg-count">${icon('chat', 14)} ${c.messageCount} mensaje${c.messageCount !== 1 ? 's' : ''}</span>
          <div class="footer-right">
            <span class="time-ago">${timeAgo(c.updatedAt)}</span>
          </div>
        </div>
      </a>`).join('');
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderEmptyState() {
    const grid = document.getElementById('casos-grid');
    const countEl = document.getElementById('casos-count');
    countEl.textContent = '0 casos · Ordenados por actividad reciente';
    grid.innerHTML = `
      <div class="empty-state">
        <p><strong>Aún no tenés casos</strong></p>
        <p>Creá tu primera conversación y convertí tu idea en una oportunidad.</p>
        <a href="chat.html" class="btn btn-primary" style="margin-top:16px">Crear mi primer caso</a>
      </div>`;
  }

  // ---------- Búsqueda ----------
  function filterCases(cases, query) {
    if (!query) return cases;
    const q = query.toLowerCase();
    return cases.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.summary.toLowerCase().includes(q)
    );
  }

  // ---------- Init ----------
  document.addEventListener('DOMContentLoaded', () => {
    // Iconos inline en la search bar
    const searchIcon = document.getElementById('search-icon-placeholder');
    if (searchIcon) searchIcon.innerHTML = icon('search', 18);

    const tuneBtn = document.getElementById('search-tune-btn');
    if (tuneBtn) tuneBtn.innerHTML = icon('tune', 18);

    const allCases = BIDChat.list(userEmail).map(chatToCase);

    if (!allCases.length) {
      renderEmptyState();
    } else {
      renderCards(allCases);
    }

    // Búsqueda
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        renderCards(filterCases(allCases, searchInput.value));
      });
    }

    // Enlaces ficticios
    document.querySelectorAll('[data-fake]').forEach(link => {
      link.addEventListener('click', e => e.preventDefault());
    });
  });
})();