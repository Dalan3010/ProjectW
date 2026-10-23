import { BoltIcon, ChartIcon, CheckCircleIcon, LayersIcon } from "./icons";

const benefits = [
  {
    icon: <BoltIcon />,
    title: "Análisis rápido",
    text: "Resultados en minutos, no en semanas.",
  },
  {
    icon: <ChartIcon />,
    title: "Ideas basadas en datos",
    text: "Decisiones respaldadas por información real.",
  },
  {
    icon: <CheckCircleIcon />,
    title: "Fácil de usar",
    text: "Sin curvas de aprendizaje complicadas.",
  },
  {
    icon: <LayersIcon />,
    title: "Todo en un solo lugar",
    text: "Del concepto al plan, sin cambiar de herramienta.",
  },
];

export function Benefits() {
  return (
    <section className="section" id="beneficios">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">¿Por qué BID?</h2>
          <p className="section-subtitle">Beneficios claros para quienes quieren emprender con confianza.</p>
        </div>
        <div className="benefits-grid">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="benefit-card">
              <div className="icon-circle icon-circle-sm">{benefit.icon}</div>
              <h3 className="benefit-title">{benefit.title}</h3>
              <p className="benefit-text">{benefit.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
