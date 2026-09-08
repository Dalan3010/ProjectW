/* ================================================================
   BID — Casos: datos mock + render de grid + búsqueda
   ================================================================ */

// ---------- Datos mock ----------
const mockCases = [
  { id: '1', title: 'App de delivery para mascotas', summary: 'Los dueños de mascotas no tienen acceso fácil a alimento, medicamentos y accesorios sin salir de casa.', category: 'pain', status: 'assessed', viability: 'high', tags: ['Pets', 'Delivery', 'B2C'], updatedHoursAgo: 1, messageCount: 12 },
  { id: '2', title: 'Plataforma de cursos online B2B', summary: 'Las empresas no tienen forma eficiente de capacitar a sus equipos con contenido actualizado y medible.', category: 'inefficiency', status: 'validated', viability: 'high', tags: ['EdTech', 'B2B', 'SaaS'], updatedHoursAgo: 2, messageCount: 18 },
  { id: '3', title: 'SaaS de facturación electrónica para PyMEs', summary: 'Las pequeñas empresas pierden horas semanales en procesos manuales de facturación y declaración fiscal.', category: 'inefficiency', status: 'assessed', viability: 'medium', tags: ['FinTech', 'B2B', 'Automatización'], updatedHoursAgo: 4, messageCount: 9 },
  { id: '4', title: 'Marketplace de servicios legales', summary: 'Las personas no saben cómo acceder a asesoría legal confiable y asequible cuando la necesitan.', category: 'unmet_need', status: 'draft', viability: 'medium', tags: ['LegalTech', 'Marketplace', 'B2C'], updatedHoursAgo: 7, messageCount: 5 },
  { id: '5', title: 'Herramienta IA para análisis de contratos', summary: 'Los abogados y empresas gastan demasiado tiempo revisando contratos manualmente para detectar cláusulas problemáticas.', category: 'opportunity', status: 'analyzing', viability: undefined, tags: ['LegalTech', 'IA', 'B2B'], updatedHoursAgo: 0.5, messageCount: 3 },
  { id: '6', title: 'App de bienestar mental para empleados', summary: 'El estrés laboral impacta directamente la productividad y retención del talento en empresas medianas.', category: 'pain', status: 'assessed', viability: 'high', tags: ['HealthTech', 'B2B', 'Wellness'], updatedHoursAgo: 10, messageCount: 22 },
  { id: '7', title: 'Copiloto IA para soporte al cliente', summary: 'Los equipos de soporte responden las mismas preguntas decenas de veces al día sin contexto histórico unificado.', category: 'inefficiency', status: 'validated', viability: 'high', tags: ['IA', 'B2B', 'SaaS', 'Automatización'], updatedHoursAgo: 3, messageCount: 27 },
  { id: '8', title: 'Generador IA de propuestas comerciales', summary: 'Los vendedores B2B pasan horas armando propuestas personalizadas que se pueden generar desde plantillas inteligentes.', category: 'opportunity', status: 'analyzing', viability: 'medium', tags: ['IA', 'B2B', 'SaaS', 'Sales'], updatedHoursAgo: 6, messageCount: 11 },
];

// ---------- Mapas de traducción ----------
const categoryLabels = {
  pain: 'Dolor',
  inefficiency: 'Ineficiencia',
  unmet_need: 'Necesidad no cubierta',
  opportunity: 'Oportunidad',
};

const statusConfig = {
  draft:      { label: 'Borrador',      icon: 'draft' },
  analyzing:  { label: 'Analizando...',  icon: 'autorenew' },
  assessed:   { label: 'Evaluado',       icon: 'fact_check' },
  validated:  { label: 'Validado',       icon: 'verified' },
  archived:   { label: 'Archivado',      icon: 'archive' },
};

const viabilityConfig = {
  high:   'Alta',
  medium: 'Media',
  low:    'Baja',
};

// ---------- Utilidades ----------
function timeAgo(hours) {
  if (hours < 24) {
    const n = Math.max(1, Math.round(hours));
    return `Hace ${n}h`;
  }
  const d = Math.round(hours / 24);
  return `Hace ${d}d`;
}

// ---------- Render ----------
function renderCards(cases) {
  const grid = document.getElementById('casos-grid');
  const countEl = document.getElementById('casos-count');

  if (!cases.length) {
    grid.innerHTML = '<div class="empty-state"><p>No se encontraron casos</p></div>';
    countEl.textContent = '0 casos · Ordenados por actividad reciente';
    return;
  }

  countEl.textContent = `${cases.length} caso${cases.length !== 1 ? 's' : ''} · Ordenados por actividad reciente`;

  grid.innerHTML = cases.map((c, i) => {
    const sc = statusConfig[c.status] || statusConfig.draft;
    const viabChip = c.viability
      ? `<span class="chip-viab chip-${c.viability}">${viabilityConfig[c.viability]}</span>`
      : '';

    return `
      <a href="chat.html?caso=${c.id}" class="case-card stagger-item" style="animation-delay:${i * 0.06}s">
        <div class="case-card-head">
          <span class="chip chip-outline">${categoryLabels[c.category] || c.category}</span>
          <span class="status-wrap">${icon(sc.icon, 14)} ${sc.label}</span>
        </div>
        <h3 class="case-title">${c.title}</h3>
        <p class="case-summary">${c.summary}</p>
        <div class="case-tags">${c.tags.map(t => `<span class="tag-chip">${t}</span>`).join('')}</div>
        <div class="case-footer">
          <span class="msg-count">${icon('chat', 14)} ${c.messageCount} mensajes</span>
          <div class="footer-right">
            ${viabChip}
            <span class="time-ago">${timeAgo(c.updatedHoursAgo)}</span>
          </div>
        </div>
      </a>`;
  }).join('');
}

// ---------- Búsqueda ----------
function filterCases(query) {
  if (!query) return mockCases;
  const q = query.toLowerCase();
  return mockCases.filter(c =>
    c.title.toLowerCase().includes(q) ||
    c.tags.some(t => t.toLowerCase().includes(q))
  );
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  // Iconos inline en la search bar
  const searchIcon = document.getElementById('search-icon-placeholder');
  if (searchIcon) searchIcon.innerHTML = icon('search', 18);

  const tuneBtn = document.getElementById('search-tune-btn');
  if (tuneBtn) tuneBtn.innerHTML = icon('tune', 18);

  // Render inicial
  renderCards(mockCases);

  // Búsqueda
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderCards(filterCases(searchInput.value));
    });
  }

  // Enlaces ficticios
  document.querySelectorAll('[data-fake]').forEach(link => {
    link.addEventListener('click', e => e.preventDefault());
  });
});
