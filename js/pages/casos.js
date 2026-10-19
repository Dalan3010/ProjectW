// BID — Grilla de casos: lista desde el backend real, con búsqueda en vivo.
// Incluye modo de selección múltiple para eliminar uno o varios casos con confirmación.
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

  // ---------- DOM ----------
  const grid = document.getElementById('casos-grid');
  const countEl = document.getElementById('casos-count');
  const searchInput = document.getElementById('search-input');

  const selectModeBtn = document.getElementById('select-mode-btn');
  const selectionBar = document.getElementById('selection-bar');
  const selectionCount = document.getElementById('selection-count');
  const selectAllBtn = document.getElementById('select-all-btn');
  const deleteSelectedBtn = document.getElementById('delete-selected-btn');

  const overlay = document.getElementById('confirm-overlay');
  const confirmIcon = document.getElementById('confirm-icon');
  const confirmText = document.getElementById('confirm-text');
  const confirmCancel = document.getElementById('confirm-cancel');
  const confirmAccept = document.getElementById('confirm-accept');

  // ---------- Estado ----------
  let allCases = [];
  let selectMode = false;
  let deleting = false;
  const selected = new Set();

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

  function filterCases(all, query) {
    if (!query) return all;
    const q = query.toLowerCase();
    return all.filter(
      (c) => c.title.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q)
    );
  }

  // ---------- Render ----------
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
      <a href="chat.html?caso=${encodeURIComponent(c.id)}" class="case-card stagger-item${selected.has(c.id) ? ' selected' : ''}" data-id="${escapeHtml(c.id)}" style="animation-delay:${i * 0.06}s">
        <span class="case-select" aria-hidden="true">${icon('check', 14)}</span>
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

  function updateSelectionUI() {
    const count = selected.size;
    selectionCount.textContent = count === 1 ? '1 seleccionado' : `${count} seleccionados`;
    deleteSelectedBtn.disabled = count === 0 || deleting;

    const visible = filterCases(allCases, searchInput.value);
    const allSelected = visible.length > 0 && visible.every((c) => selected.has(c.id));
    selectAllBtn.textContent = allSelected ? 'Deseleccionar todo' : 'Seleccionar todo';
  }

  function render() {
    if (!allCases.length) {
      renderEmptyState();
      grid.classList.remove('select-mode');
      selectionBar.classList.add('hidden');
      updateSelectionUI();
      return;
    }

    renderCards(filterCases(allCases, searchInput.value));
    grid.classList.toggle('select-mode', selectMode);
    selectionBar.classList.toggle('hidden', !selectMode);
    updateSelectionUI();
  }

  // Trae la lista fresca del backend y vuelve a renderizar.
  function reload() {
    return casesApi
      .list()
      .then((response) => {
        allCases = (response.data || []).map(normalizeCase);
        render();
      })
      .catch((error) => renderError(error.message));
  }

  // ---------- Modo selección ----------
  function setSelectMode(on) {
    selectMode = on;
    if (!on) selected.clear();
    selectModeBtn.textContent = on ? 'Cancelar' : 'Seleccionar';
    selectModeBtn.setAttribute('aria-pressed', String(on));
    selectModeBtn.classList.toggle('active', on);
    render();
  }

  function toggleCard(card) {
    const id = card.dataset.id;
    if (selected.has(id)) {
      selected.delete(id);
      card.classList.remove('selected');
    } else {
      selected.add(id);
      card.classList.add('selected');
    }
    updateSelectionUI();
  }

  // ---------- Confirmación ----------
  function openConfirm() {
    const count = selected.size;
    if (!count) return;
    confirmText.textContent = count === 1
      ? '¿Seguro que querés eliminar este caso? Esta acción no se puede deshacer.'
      : `¿Seguro que querés eliminar estos ${count} casos? Esta acción no se puede deshacer.`;
    overlay.classList.remove('hidden');
    confirmAccept.focus();
  }

  function closeConfirm() {
    if (deleting) return;
    overlay.classList.add('hidden');
  }

  // Borrado contra el backend: un DELETE por caso seleccionado.
  // Si alguno falla, la lista recargada sigue mostrando lo que quedó en el servidor.
  function deleteSelected() {
    const ids = [...selected];
    if (!ids.length || deleting) return;

    deleting = true;
    confirmAccept.disabled = true;
    confirmAccept.textContent = 'Eliminando…';

    Promise.allSettled(ids.map((id) => casesApi.archive(id))).finally(() => {
      deleting = false;
      confirmAccept.disabled = false;
      confirmAccept.textContent = 'Eliminar';
      selected.clear();
      overlay.classList.add('hidden');
      reload().then(() => {
        if (!allCases.length) setSelectMode(false);
      });
    });
  }

  // ---------- Init ----------
  renderUserChip(session);
  renderLogoutButton(session);

  document.getElementById('search-icon-placeholder').innerHTML = icon('search', 18);
  document.getElementById('search-tune-btn').innerHTML = icon('tune', 18);
  confirmIcon.innerHTML = icon('trash', 26);

  // Estado de carga mientras el backend responde
  grid.innerHTML = '<div class="empty-state"><p>Cargando casos…</p></div>';
  reload();

  // ---------- Eventos ----------
  selectModeBtn.addEventListener('click', () => setSelectMode(!selectMode));

  grid.addEventListener('click', (event) => {
    const card = event.target.closest('.case-card');
    if (!card) return;
    // Fuera del modo selección la tarjeta navega normal al chat.
    if (!selectMode) return;
    event.preventDefault();
    toggleCard(card);
  });

  selectAllBtn.addEventListener('click', () => {
    const visible = filterCases(allCases, searchInput.value);
    const allSelected = visible.length > 0 && visible.every((c) => selected.has(c.id));
    visible.forEach((c) => (allSelected ? selected.delete(c.id) : selected.add(c.id)));
    grid.querySelectorAll('.case-card').forEach((card) => {
      card.classList.toggle('selected', selected.has(card.dataset.id));
    });
    updateSelectionUI();
  });

  deleteSelectedBtn.addEventListener('click', openConfirm);
  confirmCancel.addEventListener('click', closeConfirm);
  confirmAccept.addEventListener('click', deleteSelected);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeConfirm();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !overlay.classList.contains('hidden')) closeConfirm();
  });

  searchInput.addEventListener('input', render);

  bindFakeLinks();
}
