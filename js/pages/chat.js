// BID — Chat del asistente contra el backend real.
// El flujo replica el useChat de FronHack: el primer mensaje crea el caso vía
// /chat/start, los siguientes van a /chat, y ?caso=<id> carga el historial
// desde /cases/<id>/messages. Las tarjetas ricas se arman desde message.metadata.

import { chatApi } from '../api/chat.js';
import { icon } from '../icons.js';
import { PROMPTS } from '../assistant.js';
import {
  escapeHtml,
  requireSession,
  renderUserChip,
  renderLogoutButton,
  bindFakeLinks,
} from '../ui.js';

const session = requireSession();

if (session) {
  // ---------- Estado ----------
  let activeChatId = null;
  let isProcessing = false;

  // ---------- DOM ----------
  const welcomeEl = document.getElementById('welcome');
  const threadEl = document.getElementById('thread');
  const textarea = document.getElementById('chat-textarea');
  const sendBtn = document.getElementById('send-btn');
  const inputBox = document.getElementById('chat-input-box');
  const bottomRef = document.getElementById('bottom-ref');
  const promptGrid = document.getElementById('prompt-grid');
  const welcomeLogo = document.getElementById('welcome-logo-placeholder');

  // ---------- Utilidades ----------
  function now(iso) {
    const date = iso ? new Date(iso) : new Date();
    return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  }

  function scrollToBottom() {
    setTimeout(() => {
      bottomRef.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 50);
  }

  renderUserChip(session);
  renderLogoutButton(session);

  // ---------- Mini renderer markdown ----------
  function renderMd(text) {
    const lines = text.split('\n');
    let html = '';
    let inList = false;

    for (const raw of lines) {
      const line = raw;

      // Línea vacía → spacer
      if (line.trim() === '') {
        if (inList) { inList = false; }
        html += '<div class="md-spacer"></div>';
        continue;
      }

      // # heading → h6 bold
      if (line.startsWith('# ')) {
        html += `<p class="md-h">${inlineBold(line.slice(2))}</p>`;
        continue;
      }

      // ## subheading
      if (line.startsWith('## ')) {
        html += `<p class="md-sub">${inlineBold(line.slice(3))}</p>`;
        continue;
      }

      // Bullet: - texto
      if (line.startsWith('- ')) {
        const content = inlineBold(escapeHtml(line.slice(2)));
        html += `<div class="md-bullet"><span class="dot">•</span><p>${content}</p></div>`;
        continue;
      }

      // Bold completo: **...**
      if (/^\*\*[^*]+\*\*$/.test(line.trim())) {
        html += `<p class="md-bold">${inlineBold(escapeHtml(line.trim()))}</p>`;
        continue;
      }

      // Línea normal
      html += `<p class="md-line">${inlineBold(escapeHtml(line))}</p>`;
    }

    return html;
  }

  function inlineBold(text) {
    return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  }

  // ---------- Tarjetas ricas (desde metadata del backend) ----------
  // El backend usa willingnessToPlay/mainRisks; los renderers esperan
  // willingnessToPay/risks: adaptamos en el paso de metadata → card.
  function assessmentFromMeta(a) {
    return {
      urgency: a.urgency,
      frequency: a.frequency,
      severity: a.severity,
      willingnessToPay: a.willingnessToPlay,
      targetSegment: a.targetSegment,
      risks: a.mainRisks || [],
      overallScore: a.overallScore,
    };
  }

  function ideaFromMeta(i) {
    return {
      title: i.title,
      desc: i.description,
      revenue: i.revenueModel,
      difficulty: i.entryDifficulty,
      time: i.implementationSpeed,
      score: i.potentialScore,
      tags: i.tags || [],
    };
  }

  function renderAssessmentCard(data) {
    const scoreBars = [
      { label: 'Urgencia', value: data.urgency },
      { label: 'Frecuencia', value: data.frequency },
      { label: 'Severidad', value: data.severity },
      { label: 'Disposición a pagar', value: data.willingnessToPay },
    ];

    const barsHtml = scoreBars.map(b => `
      <div class="score-bar">
        <div class="score-top"><span>${b.label}</span><b>${b.value}/5</b></div>
        <div class="score-track"><div class="score-fill" style="width:${(b.value / 5) * 100}%"></div></div>
      </div>`).join('');

    const risksHtml = data.risks.map(r => `<span class="risk-chip">${escapeHtml(r)}</span>`).join('');

    return `
      <div class="rich-card">
        <div class="assess-head">
          <h4>Evaluación de Oportunidad</h4>
          <span class="chip-viab chip-high">Viabilidad: Alta</span>
        </div>
        <p class="seg-label">Segmento objetivo</p>
        <p class="seg-value">${escapeHtml(data.targetSegment)}</p>
        ${barsHtml}
        <p class="risks-label">Principales riesgos</p>
        <div class="risks-row">${risksHtml}</div>
        <div class="score-footer">${icon('insights', 16)} Score general: <strong>${data.overallScore}/100</strong></div>
      </div>`;
  }

  function renderIdeaCard(idea, index, isTop) {
    const diffColors = { low: 'chip-low', medium: 'chip-medium', high: 'chip-high' };
    const diffLabels = { low: 'Baja', medium: 'Media', high: 'Alta' };
    const timeLabels = { weeks: 'semanas', months: 'meses', quarters: 'trimestres' };

    const topClass = isTop ? ' top' : '';
    const topBadge = isTop ? '<span class="top-badge">Mayor potencial</span>' : '';
    const headPad = isTop ? ' style="padding-right:90px"' : '';

    return `
      <div class="idea-card${topClass}">
        ${topBadge}
        <div class="idea-head"${headPad}>
          <div class="idea-rank">${index + 1}</div>
          <h5>${escapeHtml(idea.title)}</h5>
        </div>
        <p class="idea-desc">${escapeHtml(idea.desc)}</p>
        <div class="rev-row">${icon('payments', 14, 'icon-success')} <span>${escapeHtml(idea.revenue)}</span></div>
        <div class="idea-chips">
          <span class="chip-viab ${diffColors[idea.difficulty]}">Dificultad: ${diffLabels[idea.difficulty]}</span>
          <span class="chip chip-outline">Tiempo: ${timeLabels[idea.time]}</span>
          <span class="chip chip-accent">Score: ${idea.score}</span>
        </div>
        <div class="idea-tags">${idea.tags.map(t => `<span>#${escapeHtml(t)}</span>`).join(' ')}</div>
      </div>`;
  }

  function renderNextSteps(steps) {
    const stepsHtml = steps.map((s, i) => `
      <div class="next-step">
        <div class="step-num">${i + 1}</div>
        <p>${escapeHtml(s)}</p>
      </div>`).join('');

    return `
      <div class="next-card">
        <div class="next-head">${icon('flag', 18, 'icon-warning')} <h4>Próximos pasos recomendados</h4></div>
        ${stepsHtml}
      </div>`;
  }

  // Si el mensaje trae metadata de análisis, sumamos las tarjetas ricas al HTML.
  function renderAssistantContent(message) {
    let html = renderMd(message.content || '');
    const meta = message.metadata;

    if (meta && meta.type === 'analysis') {
      if (meta.analysis) html += renderAssessmentCard(assessmentFromMeta(meta.analysis));
      if (meta.ideas && meta.ideas.length) {
        html += '<p class="ideas-label">Ideas de negocio propuestas</p>';
        meta.ideas.forEach((idea, i) => { html += renderIdeaCard(ideaFromMeta(idea), i, i === 0); });
      }
      if (meta.nextSteps && meta.nextSteps.length) html += renderNextSteps(meta.nextSteps);
      if (meta.confidence !== undefined) {
        html += `<div class="conf-foot">${icon('verified', 14)} Confianza del análisis: <strong>${meta.confidence}%</strong></div>`;
      }
    }

    return html;
  }

  // ---------- Burbujas ----------
  function addUserMessage(text, iso) {
    const row = document.createElement('div');
    row.className = 'msg-row user msg-appear';
    row.innerHTML = `
      <div class="msg-body">
        <div class="msg-bubble"><p class="md-line">${escapeHtml(text)}</p></div>
        <div class="msg-time">${now(iso)}</div>
      </div>`;
    threadEl.appendChild(row);
    scrollToBottom();
  }

  function addBotMessage(html, iso) {
    const row = document.createElement('div');
    row.className = 'msg-row bot msg-appear';
    row.innerHTML = `
      <div class="bot-avatar">${icon('smart_toy', 18)}</div>
      <div class="msg-body">
        <div class="msg-bubble">${html}</div>
        <div class="msg-time">${now(iso)}</div>
      </div>`;
    threadEl.appendChild(row);
    scrollToBottom();
  }

  function showTyping() {
    const row = document.createElement('div');
    row.className = 'msg-row bot typing-row';
    row.id = 'typing-indicator';
    row.innerHTML = `
      <div class="bot-avatar">${icon('smart_toy', 18)}</div>
      <div class="msg-body">
        <div class="typing-bubble">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>`;
    threadEl.appendChild(row);
    scrollToBottom();
  }

  function removeTyping() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
  }

  function showError(text) {
    const row = document.createElement('div');
    row.className = 'msg-row bot msg-appear';
    row.innerHTML = `
      <div class="bot-avatar">${icon('smart_toy', 18)}</div>
      <div class="msg-body">
        <div class="msg-bubble"><p class="md-line">${escapeHtml(text)}</p></div>
      </div>`;
    threadEl.appendChild(row);
    scrollToBottom();
  }

  // ---------- Mensajes del backend → burbujas ----------
  function renderMessage(message) {
    if (message.role === 'user') {
      addUserMessage(message.content, message.timestamp);
    } else {
      addBotMessage(renderAssistantContent(message), message.timestamp);
    }
  }

  async function loadCase(caseId) {
    try {
      const messages = await chatApi.getMessages(caseId);
      activeChatId = caseId;
      welcomeEl.classList.add('hidden');
      threadEl.textContent = '';
      (messages || []).forEach(renderMessage);
    } catch (error) {
      showError(`No se pudo cargar el caso: ${error.message}`);
    }
  }

  // ---------- Envío ----------
  async function processMessage(text) {
    if (isProcessing) return;
    isProcessing = true;
    updateSendBtn();

    addUserMessage(text);
    showTyping();

    try {
      let response;
      if (!activeChatId) {
        response = await chatApi.startCase(text);
        activeChatId = response.caseId;
      } else {
        response = await chatApi.sendMessage({ caseId: activeChatId, content: text });
      }
      removeTyping();
      renderMessage(response.message);
    } catch (error) {
      removeTyping();
      showError(`No se pudo enviar el mensaje: ${error.message}`);
    } finally {
      isProcessing = false;
      updateSendBtn();
    }
  }

  // ---------- Input ----------
  function autoGrow() {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  }

  function updateSendBtn() {
    const hasText = textarea.value.trim().length > 0;
    if (isProcessing) {
      sendBtn.classList.remove('active');
      sendBtn.innerHTML = icon('autorenew', 16);
      sendBtn.disabled = true;
    } else if (hasText) {
      sendBtn.classList.add('active');
      sendBtn.innerHTML = icon('send', 16);
      sendBtn.disabled = false;
    } else {
      sendBtn.classList.remove('active');
      sendBtn.innerHTML = icon('send', 16);
      sendBtn.disabled = true;
    }

    // Estado filled del input box
    if (hasText) {
      inputBox.classList.add('filled');
    } else {
      inputBox.classList.remove('filled');
    }
  }

  function handleSend() {
    const text = textarea.value.trim();
    if (!text || isProcessing) return;
    textarea.value = '';
    autoGrow();
    updateSendBtn();
    processMessage(text);
  }

  // ---------- Welcome prompts ----------
  function renderPrompts() {
    promptGrid.innerHTML = PROMPTS.map(p => `
      <button class="prompt-card" data-prompt="${escapeHtml(p.title)}">
        <div class="prompt-icon">${icon(p.icon, 22)}</div>
        <p class="prompt-title">${escapeHtml(p.title)}</p>
        <p class="prompt-desc">${escapeHtml(p.desc)}</p>
      </button>`).join('');

    promptGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.prompt-card');
      if (!card) return;
      const promptText = card.getAttribute('data-prompt');
      if (promptText) {
        textarea.value = promptText;
        autoGrow();
        updateSendBtn();
        handleSend();
      }
    });
  }

  // ---------- Init ----------
  // Logo de bienvenida
  welcomeLogo.innerHTML = `
    <svg width="44" height="44" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="welcome-logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#8b5cf6" />
          <stop offset="1" stop-color="#a78bfa" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="16" height="16" rx="4" transform="rotate(45 16 16)" fill="url(#welcome-logo-grad)" />
    </svg>`;

  // Estado inicial del botón enviar (deshabilitado, sin texto)
  updateSendBtn();

  // Render prompt cards
  renderPrompts();

  // Restaurar conversación desde ?caso=ID (historial real del backend)
  const params = new URLSearchParams(window.location.search);
  const casoId = params.get('caso');
  if (casoId) {
    welcomeEl.classList.add('hidden');
    loadCase(casoId);
  }

  // Eventos textarea
  textarea.addEventListener('input', () => {
    autoGrow();
    updateSendBtn();
  });

  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  sendBtn.addEventListener('click', handleSend);

  bindFakeLinks();
}
