const steps = [
  {
    title: "1. Cuéntanos tu idea",
    description: "Describe tu idea en pocas palabras y deja que el proceso comience.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12a8 8 0 0 1-8 8H4l2.5-2.5A8 8 0 1 1 21 12Z" />
      </svg>
    ),
  },
  {
    title: "2. Analizamos la oportunidad",
    description: "Nuestro sistema estudia el mercado, la demanda y la viabilidad.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    title: "3. Obtén una idea de negocio",
    description: "Recibe una propuesta clara y accionable para empezar.",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V17h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2Z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="section" id="como-funciona">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">¿Cómo funciona?</h2>
          <p className="section-subtitle">
            Tres pasos simples para pasar de una idea a una oportunidad de negocio.
          </p>
        </div>
        <div className="how-grid">
          {steps.map((step) => (
            <div className="card" key={step.title}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "var(--accent-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent)",
                }}
              >
                {step.icon}
              </div>
              <h3
                style={{
                  marginTop: 20,
                  marginBottom: 8,
                  fontSize: "1.15rem",
                  fontWeight: 700,
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.95rem",
                  margin: 0,
                }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}