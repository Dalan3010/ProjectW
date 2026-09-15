// BID — Guion del asistente de validación de ideas (datos estáticos del chat).

// Se guarda como content del mensaje del bot; al reabrir una conversación
// se detecta este valor y se regenera el HTML del análisis desde cero.
export const ANALYSIS_SENTINEL = '__ANALYSIS__';

// Preguntas de clarificación
export const CLARIFYING_QUESTIONS = [
  '¡Excelente punto de partida! Para entender mejor el problema, necesito hacerte algunas preguntas:\n\n**¿Quién experimenta este problema más frecuentemente?**\n- ¿Son empresas (B2B) o personas individuales (B2C)?\n- ¿Qué rango de edad o perfil tienen?\n- ¿En qué industria o contexto ocurre?\n\nCuéntame con el mayor detalle posible.',

  'Perfecto, eso me da más contexto. Ahora profundicemos en la intensidad del problema:\n\n**¿Con qué frecuencia enfrentan este problema?**\n- ¿Es algo diario, semanal, mensual?\n- ¿Cuánto tiempo pierden o cuánto dinero les cuesta actualmente?\n- ¿Ya intentaron resolver esto con alguna solución existente? ¿Por qué no les funcionó?',

  'Muy interesante. Esto me ayuda a mapear la oportunidad real.\n\n**Una última pregunta antes de generar el análisis:**\n- ¿Tienes acceso a potenciales clientes para validar esta idea?\n- ¿Cuánto crees que estarían dispuestos a pagar por una solución?\n- ¿Existe alguna regulación o barrera importante en este sector?\n\nCon esto podré darte un análisis completo.',
];

export const FALLBACK_RESPONSE = 'Entiendo tu punto. Esto me da una perspectiva clara sobre la oportunidad.\n\nPara hacer el análisis más preciso: **¿podrías darme más detalles sobre el impacto económico o de tiempo que este problema causa?** Eso me ayudará a estimar el tamaño real del mercado y la disposición a pagar.';

// Prompt cards de bienvenida
export const PROMPTS = [
  { icon: 'search',       title: 'Explorar un problema',     desc: 'Tengo una molestia o ineficiencia que quiero convertir en oportunidad' },
  { icon: 'lightbulb',    title: 'Validar una idea',         desc: 'Tengo una idea de negocio y quiero saber si realmente tiene mercado' },
  { icon: 'trending_up',  title: 'Analizar una tendencia',   desc: 'Vi una tendencia emergente y quiero saber cómo monetizarla' },
  { icon: 'group',        title: 'Entender un segmento',     desc: 'Conozco un grupo de personas con un dolor específico y no sé cómo servirles' },
];

// Análisis completo (4to mensaje)
export const ANALYSIS_CONTENT = `
# Análisis Completo de tu Oportunidad de Negocio

Basado en toda la información que compartiste, aquí está mi evaluación:

## Diagnóstico del Problema
El problema que describes tiene características de una **ineficiencia sistémica** con alta frecuencia e impacto moderado. Esto es positivo porque significa que hay disposición real a pagar por una solución.

## Segmento Objetivo
**PYMEs con 10-100 empleados en Latinoamérica** → Alta densidad del problema, capacidad de pago, ciclo de ventas manejable.

## Evaluación de Viabilidad: **ALTA** ✓

He identificado **3 ideas de negocio** ordenadas por potencial:`;

export const CONFIDENCE = 76;

export const ASSESSMENT_DATA = {
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

export const IDEAS = [
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

export const NEXT_STEPS = [
  'Entrevistar a 5-10 potenciales clientes esta semana',
  'Crear un landing page con una lista de espera',
  'Construir un prototipo mínimo (mockup o wireframe)',
  'Validar disposición a pagar con una oferta real',
  'Documentar los aprendizajes y iterar',
];