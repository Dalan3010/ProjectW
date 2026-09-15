// BID — Chat del asistente con persistencia real por usuario.
// El guion (preguntas, análisis, prompt cards) vive en assistant.js; acá solo
// queda el comportamiento: render, typing simulado y guardado en localStorage.

import { chats } from '../chats.js';
import { icon } from '../icons.js';
import {
  ANALYSIS_SENTINEL,
  CLARIFYING_QUESTIONS,
  FALLBACK_RESPONSE,
  PROMPTS,
  ANALYSIS_CONTENT,
  CONFIDENCE,
  ASSESSMENT_DATA,
  IDEAS,
  NEXT_STEPS,
} from '../assistant.js';
import {
  escapeHtml,
  requireSession,
  renderUserChip,
  renderLogoutButton,
  bindFakeLinks,
} from '../ui.js';

const session = requireSession();

if (session) {
  const userEmail = session.email;

  // ---------- Estado ----------
  let activeChatId = null;
  let userMsgCount = 0;
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
  function now() {
    return new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  }

  function scrollToBottom() {
    setTimeout(() => {
      bottomRef.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 50);
  }

  renderUserChip(session);
  renderLogoutButton(session);

  // ---------- Mini renderer markdown (datos mock controlados) ----------
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

  // ---------- Render de tarjetas ricas ----------
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
        <div class="idea-tags">${idea.tags.map(t => `<span>#${t}</span>`).join(' ')}</div>
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

  function renderAnalysis() {
    let html = renderMd(ANALYSIS_CONTENT);
    html += renderAssessmentCard(ASSESSMENT_DATA);
    html += '<p class="ideas-label">Ideas de negocio propuestas</p>';
    IDEAS.forEach((idea, i) => { html += renderIdeaCard(idea, i, i === 0); });
    html += renderNextSteps(NEXT_STEPS);
    html += `<div class="conf-foot">${icon('verified', 14)} Confianza del análisis: <strong>${CONFIDENCE}%</strong></div>`;
    return html;
  }

  // ---------- Burbujas ----------
  function msgTime() { return now(); }

  function addUserMessage(text) {
    const row = document.createElement('div');
    row.className = 'msg-row user msg-appear';
    row.innerHTML = `
      <div class="msg-body">
        <div class="msg-bubble"><p class="md-line">${escapeHtml(text)}</p></div>
        <div class="msg-time">${msgTime()}</div>
      </div>`;
    threadEl.appendChild(row);
    scrollToBottom();
  }

  function addBotMessage(html) {
    const row = document.createElement('div');
    row.className = 'msg-row bot msg-appear';
    row.innerHTML = `
      <div class="bot-avatar">${icon('smart_toy', 18)}</div>
      <div class="msg-body">
        <div class="msg-bubble">${html}</div>
        <div class="msg-time">${msgTime()}</div>
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

  // ---------- Persistencia ----------
  function persistMessage(role, content) {
    if (!activeChatId) return null;
    return chats.addMessage(userEmail, activeChatId, { role, content });
  }

  // Al reabrir, el sentinel del análisis se regenera como HTML completo.
  function renderStoredMessage(message) {
    if (message.role === 'user') {
      addUserMessage(message.content);
    } else if (message.content === ANALYSIS_SENTINEL) {
      addBotMessage(renderAnalysis());
    } else {
      addBotMessage(renderMd(message.content));
    }
  }

  function loadChat(chatId) {
    const chat = chats.get(userEmail, chatId);
    if (!chat) return null;
    activeChatId = chatId;
    welcomeEl.classList.add('hidden');
    threadEl.textContent = '';
    chat.messages.forEach(renderStoredMessage);
    // El contador se reconstruye del historial real, no de una suposición.
    userMsgCount = chat.messages.filter((m) => m.role === 'user').length;
    return chat;
  }

  // ---------- Lógica de respuestas ----------
  function getBotResponse(text) {
    const lower = text.toLowerCase();

    // Saludo antes del 4to mensaje
    if (userMsgCount < 4 && /\b(hola|buenas|hi|hey|hola!\b)/i.test(lower)) {
      return '¡Hola! Soy **BID**, tu asistente de validación de ideas de negocio. 🚀\n\n¿Qué problema o idea quieres explorar hoy? Cuéntame con el mayor detalle posible.';
    }

    if (userMsgCount === 1) return CLARIFYING_QUESTIONS[0];
    if (userMsgCount === 2) return CLARIFYING_QUESTIONS[1];
    if (userMsgCount === 3) return CLARIFYING_QUESTIONS[2];

    // 4to mensaje → análisis completo
    if (userMsgCount === 4) return ANALYSIS_SENTINEL;

    return FALLBACK_RESPONSE;
  }

  function processMessage(text) {
    if (isProcessing) return;
    isProcessing = true;
    updateSendBtn();

    // El chat nace recién con el primer mensaje: evita conversaciones huérfanas.
    if (!activeChatId) {
      activeChatId = chats.create(userEmail).id;
    }

    addUserMessage(text);
    userMsgCount++;
    persistMessage('user', text);

    const response = getBotResponse(text);

    // Simular typing
    const delay = 800 + Math.random() * 1200;
    showTyping();

    setTimeout(() => {
      removeTyping();

      if (response === ANALYSIS_SENTINEL) {
        addBotMessage(renderAnalysis());
      } else {
        addBotMessage(renderMd(response));
      }

      // El sentinel se guarda tal cual; al reabrir se regenera el HTML.
      persistMessage('assistant', response);

      isProcessing = false;
      updateSendBtn();
    }, delay);
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

  // Restaurar conversación desde ?caso=ID
  const params = new URLSearchParams(window.location.search);
  const casoId = params.get('caso');

  if (casoId) {
    const chat = loadChat(casoId);
    if (chat && chat.messages.length === 0) {
      // Caso recién creado sin mensajes: abrimos con un saludo que queda persistido.
      const greeting = '¡Hola! Empezamos un nuevo **caso**. Contame tu idea o el problema que querés resolver y voy a hacerte algunas preguntas para analizar la oportunidad.';
      addBotMessage(renderMd(greeting));
      persistMessage('assistant', greeting);
      userMsgCount = 0;
    }
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