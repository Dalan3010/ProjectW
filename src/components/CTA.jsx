import { Link } from "react-router-dom";

const ctaStyle = `
  .cta-card {
    position: relative;
    max-width: 760px;
    margin: auto;
    text-align: center;
    padding: 64px 32px;
    background: linear-gradient(160deg, var(--surface) 0%, var(--surface-2) 100%);
    border: 1px solid rgba(139, 92, 246, 0.35);
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    overflow: hidden;
  }

  .cta-card::before {
    content: "";
    position: absolute;
    top: -120px;
    left: 50%;
    transform: translateX(-50%);
    width: 420px;
    height: 260px;
    background: radial-gradient(closest-side, var(--accent-glow), transparent 70%);
    pointer-events: none;
  }
`;

export default function CTA() {
  return (
    <section className="section">
      <style>{ctaStyle}</style>
      <div className="container">
        <div className="cta-card">
          <h2
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
              fontWeight: 800,
              margin: 0,
            }}
          >
            ¿Tienes una idea?
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              margin: "16px auto 32px",
              maxWidth: 480,
            }}
          >
            Descubre cómo convertirla en una oportunidad de negocio.
          </p>
          <Link to="/login" className="btn btn-primary btn-lg">
            Comenzar ahora
          </Link>
        </div>
      </div>
    </section>
  );
}