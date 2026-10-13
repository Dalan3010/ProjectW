// BID — Grilla de casos: lista desde el backend real, con búsqueda en vivo.
// Cada tarjeta enlaza a chat.html?caso=<id> para retomar la conversación.

import { casesApi } from '../api/cases.js';
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
  const summaryLength = 150;
  const EMPTY_SUMMARY = 'Todavía no hay mensajes. Abrí este caso para empezar la conversación.';

  const grid = document.getElementById('casos-grid');
  const countEl = document.getElementById('casos-count');
  const searchInput = document.getElementById('search-input');

  let allCases = [];

  // El caso del backend ya viene con title/summary/messageCount/updatedAt.
  function normalizeCase(item) {
    let summary = (item.summary || '').trim();
    if (!summary) summary = EMPTY_SUMMARY;
    else if (summary.length > summaryLength) summary = `${summary.slice(0, summaryLength)}…`;
    return {
      id: item.id,
      title: item.title || 'Nueva conversación',
      summary,
      messageCount: item.messageCount || 0,
      updatedAt: item.updatedAt,
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

  function renderError(message) {
    grid.innerHTML = `
      <div class="empty-state">
        <p><strong>No se pudieron cargar los casos</strong></p>
        <p>${escapeHtml(message)}</p>
      </div>`;
    countEl.textContent = '0 casos';
  }

  function filterCases(cases, query) {
    if (!query) return cases;
    const q = query.toLowerCase();
    return cases.filter(
      (c) => c.title.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q)
    );
  }

  renderUserChip(session);
  renderLogoutButton(session);

  // Iconos inline de la search bar
  document.getElementById('search-icon-placeholder').innerHTML = icon('search', 18);
  document.getElementById('search-tune-btn').innerHTML = icon('tune', 18);

  // Estado de carga mientras el backend responde
  grid.innerHTML = '<div class="empty-state"><p>Cargando casos…</p></div>';

  casesApi.list()
    .then((response) => {
      allCases = (response.data || []).map(normalizeCase);
      if (!allCases.length) {
        renderEmptyState();
      } else {
        renderCards(allCases);
      }
    })
    .catch((error) => renderError(error.message));

  // Búsqueda en vivo por título y resumen
  searchInput.addEventListener('input', () => {
    renderCards(filterCases(allCases, searchInput.value));
  });

  bindFakeLinks();
}
