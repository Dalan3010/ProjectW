/* ================================================================
   BID — Chat: asistente mock de validación de ideas
   (persistido por usuario vía BIDChat)
   ================================================================ */

(function () {
  'use strict';

  const session = BIDAuth.currentUser();
  if (!session) {
    window.location.href = 'login.html';
    return;
  }
  const userEmail = session.email;

  // Preguntas de clarificación
  const CLARIFYING_QUESTIONS = [
    '¡Excelente punto de partida! Para entender mejor el problema, necesito hacerte algunas preguntas:\n\n**¿Quién experimenta este problema más frecuentemente?**\n- ¿Son empresas (B2B) o personas individuales (B2C)?\n- ¿Qué rango de edad o perfil tienen?\n- ¿En qué industria o contexto ocurre?\n\nCuéntame con el mayor detalle posible.',

    'Perfecto, eso me da más contexto. Ahora profundicemos en la intensidad del problema:\n\n**¿Con qué frecuencia enfrentan este problema?**\n- ¿Es algo diario, semanal, mensual?\n- ¿Cuánto tiempo pierden o cuánto dinero les cuesta actualmente?\n- ¿Ya intentaron resolver esto con alguna solución existente? ¿Por qué no les funcionó?',

    'Muy interesante. Esto me ayuda a mapear la oportunidad real.\n\n**Una última pregunta antes de generar el análisis:**\n- ¿Tienes acceso a potenciales clientes para validar esta idea?\n- ¿Cuánto crees que estarían dispuestos a pagar por una solución?\n- ¿Existe alguna regulación o barrera importante en este sector?\n\nCon esto podré darte un análisis completo.',
  ];

  const FALLBACK_RESPONSE = 'Entiendo tu punto. Esto me da una perspectiva clara sobre la oportunidad.\n\nPara hacer el análisis más preciso: **¿podrías darme más detalles sobre el impacto económico o de tiempo que este problema causa?** Eso me ayudará a estimar el tamaño real del mercado y la disposición a pagar.';

  // Prompt cards de bienvenida
  const PROMPTS = [
    { icon: 'search',       title: 'Explorar un problema',     desc: 'Tengo una molestia o ineficiencia que quiero convertir en oportunidad' },
    { icon: 'lightbulb',    title: 'Validar una idea',         desc: 'Tengo una idea de negocio y quiero saber si realmente tiene mercado' },
    { icon: 'trending_up',  title: 'Analizar una tendencia',   desc: 'Vi una tendencia emergente y quiero saber cómo monetizarla' },
    { icon: 'group',        title: 'Entender un segmento',     desc: 'Conozco un grupo de personas con un dolor específico y no sé cómo servirles' },
  ];

  // Análisis completo (4to mensaje)
  const ANALYSIS_CONTENT = `
# Análisis Completo de tu Oportunidad de Negocio

Basado en toda la información que compartiste, aquí está mi evaluación:

## Diagnóstico del Problema
El problema que describes tiene características de una **ineficiencia sistémica** con alta frecuencia e impacto moderado. Esto es positivo porque significa que hay disposición real a pagar por una solución.

## Segmento Objetivo
**PYMEs con 10-100 empleados en Latinoamérica** → Alta densidad del problema, capacidad de pago, ciclo de ventas manejable.

## Evaluación de Viabilidad: **ALTA** ✓

He identificado **3 ideas de negocio** ordenadas por potencial:`;

  const CONFIDENCE = 76;

  const ASSESSMENT_DATA = {
    targetSegment: 'PYMEs con 10-100 empleados en Latinoamérica',
    urgency: 4,
    frequency: 4,
    severity: 3,
    willingnessToPay: 3,
    risks: [
      'Competencia de grandes jugadores establecidos',
      'Ciclo de venta largo en B2B',
      'Necesidad de educación del mercado',
    ],
    viability: 'high',
    overallScore: 76,
  };

  const IDEAS = [
    {
      title: 'Plataforma SaaS de Gestión Automatizada',
      desc: 'Solución en la nube que automatiza el proceso principal del problema, reduciendo tiempo y errores humanos mediante IA.',
      revenue: 'Suscripción mensual ($29-$199/mes)',
      difficulty: 'medium',
      time: 'months',
      score: 82,
      tags: ['SaaS', 'IA', 'Automatización'],
    },
    {
      title: 'Marketplace de Servicios Especializados',
      desc: 'Conecta a quienes tienen el problema con expertos que pueden resolverlo, cobrando comisión por transacción.',
      revenue: 'Comisión del 15-20% por transacción',
      difficulty: 'low',
      time: 'weeks',
      score: 74,
      tags: ['Marketplace', 'B2B2C', 'Network Effect'],
    },
    {
      title: 'Herramienta de Análisis con IA',
      desc: 'Dashboard inteligente que procesa datos del problema y genera insights accionables con recomendaciones personalizadas.',
      revenue: 'Freemium + Plan Pro ($49/mes)',
      difficulty: 'high',
      time: 'quarters',
      score: 91,
      tags: ['IA', 'Analytics', 'Data'],
    },
  ];

  const NEXT_STEPS = [
    'Entrevistar a 5-10 potenciales clientes esta semana',
    'Crear un landing page con una lista de espera',
    'Construir un prototipo mínimo (mockup o wireframe)',
    'Validar disposición a pagar con una oferta real',
    'Documentar los aprendizajes y iterar',
  ];

  // ---------- Estado ----------
  let activeChatId = null;
  let userMsgCount = 0;
  let isProcessing = false;

  // ---------- DOM refs ----------
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

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Mini renderer markdown (datos mock controlados)
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
    const chat = BIDChat.addMessage(userEmail, activeChatId, { role, content });
    return chat;
  }

  function renderStoredMessage(message) {
    if (message.role === 'user') {
      addUserMessage(message.content);
    } else if (message.content === '__ANALYSIS__') {
      addBotMessage(renderAnalysis());
    } else {
      addBotMessage(renderMd(message.content));
    }
  }

  function loadChat(chatId) {
    const chat = BIDChat.get(userEmail, chatId);
    if (!chat) return null;
    activeChatId = chatId;
    welcomeEl.classList.add('hidden');
    threadEl.textContent = '';
    chat.messages.forEach(renderStoredMessage);
    userMsgCount = chat.messages.filter(m => m.role === 'user').length;
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
    if (userMsgCount === 4) return '__ANALYSIS__';

    return FALLBACK_RESPONSE;
  }

  function processMessage(text) {
    if (isProcessing) return;
    isProcessing = true;
    updateSendBtn();

    // Crear chat recién con el primer mensaje (evita chats huérfanos)
    if (!activeChatId) {
      activeChatId = BIDChat.create(userEmail).id;
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

      if (response === '__ANALYSIS__') {
        addBotMessage(renderAnalysis());
      } else {
        addBotMessage(renderMd(response));
      }

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
    if (!promptGrid || typeof ICONS === 'undefined') return;
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
  document.addEventListener('DOMContentLoaded', () => {
    // Logo de bienvenida
    if (welcomeLogo) {
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
    }

    // Icono del botón send
    sendBtn.innerHTML = icon('send', 16);

    // Render prompt cards
    renderPrompts();

    // Restaurar conversación desde ?caso=ID
    const params = new URLSearchParams(window.location.search);
    const casoId = params.get('caso');

    if (casoId) {
      const chat = loadChat(casoId);
      if (chat && chat.messages.length === 0) {
        // Caso nuevo recién creado: abrir con un saludo persistido
        addBotMessage(renderMd('¡Hola! Empezamos un nuevo **caso**. Contame tu idea o el problema que querés resolver y voy a hacerte algunas preguntas para analizar la oportunidad.'));
        persistMessage('assistant', '¡Hola! Empezamos un nuevo **caso**. Contame tu idea o el problema que querés resolver y voy a hacerte algunas preguntas para analizar la oportunidad.');
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

    // Enlaces ficticios
    document.querySelectorAll('[data-fake]').forEach(link => {
      link.addEventListener('click', e => e.preventDefault());
    });
  });
})();