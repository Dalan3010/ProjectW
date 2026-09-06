const benefits = [
  {
    title: "Análisis rápido",
    description: "Resultados en minutos, no en semanas.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M13 2 4.5 12.5H11L9.5 22 19 10h-6.5L13 2Z" />
      </svg>
    ),
  },
  {
    title: "Ideas basadas en datos",
    description: "Decisiones respaldadas por información real.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 3v18h18" />
        <rect x="7" y="12" width="3" height="6" rx="1" />
        <rect x="12" y="8" width="3" height="10" rx="1" />
        <rect x="17" y="5" width="3" height="13" rx="1" />
      </svg>
    ),
  },
  {
    title: "Fácil de usar",
    description: "Sin curvas de aprendizaje complicadas.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="m8.5 12.5 2.5 2.5 4.5-5" />
      </svg>
    ),
  },
  {
    title: "Todo en un solo lugar",
    description: "Del concepto al plan, sin cambiar de herramienta.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m12 12 9 5-9 5-9-5 9-5Z" />
      </svg>
    ),
  },
];

export default function Benefits() {
  return (
    <section className="section" id="beneficios">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">¿Por qué BID?</h2>
          <p className="section-subtitle">
            Beneficios claros para quienes quieren emprender con confianza.
          </p>
        </div>
        <div className="benefits-grid">
          {benefits.map((benefit) => (
            <div
              className="benefit-card"
              key={benefit.title}
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: 24,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "var(--accent-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent)",
                }}
              >
                {benefit.icon}
              </div>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  marginTop: 16,
                  marginBottom: 0,
                }}
              >
                {benefit.title}
              </h3>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                  marginTop: 6,
                  marginBottom: 0,
                }}
              >
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}