import { Link } from "react-router-dom";

const heroStyle = `
  .hero {
    min-height: calc(100vh - 72px);
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    position: relative;
    padding-block: 64px;
  }

  .hero::before {
    content: "";
    position: absolute;
    top: 35%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 640px;
    height: 480px;
    background: radial-gradient(closest-side, var(--accent-glow), transparent 70%);
    pointer-events: none;
    z-index: -1;
  }
`;

export default function Hero() {
  return (
    <section className="hero">
      <style>{heroStyle}</style>
      <div style={{ maxWidth: 760 }}>
        <span
          className="animate-fade-up"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: "var(--radius-full)",
            background: "var(--accent-soft)",
            color: "var(--accent)",
            fontSize: "0.875rem",
            fontWeight: 600,
            border: "1px solid rgba(139, 92, 246, 0.35)",
            animationDelay: "0s",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M12 0C12.8 7.2 16.8 11.2 24 12C16.8 12.8 12.8 16.8 12 24C11.2 16.8 7.2 12.8 0 12C7.2 11.2 11.2 7.2 12 0Z" />
          </svg>
          Potenciado por IA
        </span>
        <h1
          className="animate-fade-up"
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            margin: "24px 0 0",
            animationDelay: "0.1s",
          }}
        >
          De la idea{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #8b5cf6, #c4b5fd)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            al negocio
          </span>
        </h1>
        <p
          className="animate-fade-up"
          style={{
            color: "var(--text-secondary)",
            fontSize: "clamp(1.05rem, 2vw, 1.25rem)",
            maxWidth: 560,
            margin: "20px auto 0",
            animationDelay: "0.2s",
          }}
        >
          Convierte tus ideas en oportunidades de negocio con ayuda de
          inteligencia artificial.
        </p>
        <div
          className="animate-fade-up"
          style={{ marginTop: 36, animationDelay: "0.3s" }}
        >
          <Link to="/login" className="btn btn-primary btn-lg">
            Probar gratis →
          </Link>
        </div>
      </div>
    </section>
  );
}