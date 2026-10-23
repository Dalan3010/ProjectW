import { BulbIcon, ChatIcon, SearchIcon } from "./icons";

const steps = [
  {
    icon: <ChatIcon />,
    title: "1. Cuéntanos tu idea",
    text: "Describe tu idea en pocas palabras y deja que el proceso comience.",
  },
  {
    icon: <SearchIcon />,
    title: "2. Analizamos la oportunidad",
    text: "Nuestro sistema estudia el mercado, la demanda y la viabilidad.",
  },
  {
    icon: <BulbIcon />,
    title: "3. Obtén una idea de negocio",
    text: "Recibe una propuesta clara y accionable para empezar.",
  },
];

export function HowItWorks() {
  return (
    <section className="section" id="como-funciona">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">¿Cómo funciona?</h2>
          <p className="section-subtitle">Tres pasos simples para pasar de una idea a una oportunidad de negocio.</p>
        </div>
        <div className="how-grid">
          {steps.map((step) => (
            <div key={step.title} className="card">
              <div className="icon-circle">{step.icon}</div>
              <h3 className="card-title">{step.title}</h3>
              <p className="card-text">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
