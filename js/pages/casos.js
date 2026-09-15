// BID — Grilla de casos: los chats del usuario como tarjetas, con búsqueda en vivo.
// Cada tarjeta enlaza a chat.html?caso=<id> para retomar la conversación.

import { chats } from '../chats.js';
import { icon } from '../icons.js';
import {
  escapeHtml,
  timeAgo,
  requireSession,
  renderUserChip,
  renderLogoutButton,
  bindFakeLinks,
} from '../ui.js';

const session = requireSession();

if (session) {
  const userEmail = session.email;
  const summaryLength = 150;

  const grid = document.getElementById('casos-grid');
  const countEl = document.getElementById('casos-count');
  const searchInput = document.getElementById('search-input');

  // Resumen: primer mensaje del usuario, con corte limpio a 150 caracteres.
  function summaryFor(chat) {
    const first = (chat.messages || []).find((m) => m.role === 'user');
    if (!first) return 'Todavía no hay mensajes. Abrí este caso para empezar la conversación.';
    const text = first.content.trim();
    return text.length > summaryLength ? `${text.slice(0, summaryLength)}…` : text;
  }

  function chatToCase(chat) {
    return {
      id: chat.id,
      title: chat.title || 'Nueva conversación',
      summary: summaryFor(chat),
      messageCount: (chat.messages || []).length,
      updatedAt: chat.updatedAt,
    };
  }

  function renderCards(cases) {
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

  function renderEmptyState() {
    grid.innerHTML = `
      <div class="empty-state">
        <p><strong>Aún no tenés casos</strong></p>
        <p>Creá tu primera conversación y convertí tu idea en una oportunidad.</p>
        <a href="chat.html" class="btn btn-primary" style="margin-top:16px">Crear mi primer caso</a>
      </div>`;
    countEl.textContent = '0 casos · Ordenados por actividad reciente';
  }

  function filterCases(all, query) {
    if (!query) return all;
    const q = query.toLowerCase();
    return all.filter(
      (c) => c.title.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q)
    );
  }

  renderUserChip(session);
  renderLogoutButton(session);

  // Iconos inline de la search bar
  document.getElementById('search-icon-placeholder').innerHTML = icon('search', 18);
  document.getElementById('search-tune-btn').innerHTML = icon('tune', 18);

  const allCases = chats.list(userEmail).map(chatToCase);

  if (!allCases.length) {
    renderEmptyState();
  } else {
    renderCards(allCases);
  }

  // Búsqueda en vivo por título y resumen
  searchInput.addEventListener('input', () => {
    renderCards(filterCases(allCases, searchInput.value));
  });

  bindFakeLinks();
}