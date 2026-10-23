import { Link } from "react-router-dom";

export function CtaCard() {
  return (
    <section className="section">
      <div className="container">
        <div className="cta-card">
          <h2 className="cta-title">¿Tienes una idea?</h2>
          <p className="cta-text">Descubre cómo convertirla en una oportunidad de negocio.</p>
          <Link to="/login" className="btn btn-primary btn-lg">
            Comenzar ahora
          </Link>
        </div>
      </div>
    </section>
  );
}
