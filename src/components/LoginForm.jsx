import { useState } from "react";
import { Link } from "react-router-dom";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [viaDemo, setViaDemo] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setSubmitted(true);
  };

  const handleDemoLogin = () => {
    setViaDemo(true);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="animate-fade-up success-state">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--success)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: "block", margin: "0 auto" }}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m8.5 12.5 2.5 2.5 4.5-5" />
        </svg>
        <h3
          style={{
            margin: "20px 0 8px",
            fontSize: "1.25rem",
            fontWeight: 700,
          }}
        >
          ¡Sesión iniciada!
        </h3>
        <p style={{ color: "var(--text-secondary)", margin: "0 0 24px" }}>
          {viaDemo
            ? "Has entrado con la cuenta demo. Esta es una simulación de acceso."
            : "Bienvenido de vuelta a BID. Esta es una simulación de acceso."}
        </p>
        <Link to="/" className="btn btn-ghost">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate={false}>
        <div className="auth-field">
          <label className="auth-label" htmlFor="email">
            Correo electrónico
          </label>
          <input
            className="auth-input"
            type="email"
            id="email"
            name="email"
            required
            placeholder="tu@correo.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="auth-field">
          <label className="auth-label" htmlFor="password">
            Contraseña
          </label>
          <input
            className="auth-input"
            type="password"
            id="password"
            name="password"
            required
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block auth-submit">
          Iniciar sesión
        </button>
      </form>
      <p className="login-switch">
        ¿No tienes cuenta?{" "}
        <a href="#" onClick={(e) => e.preventDefault()}>
          Regístrate gratis
        </a>
      </p>
      <div className="auth-divider">
        <span>o</span>
      </div>
      <button type="button" className="btn btn-ghost btn-block" onClick={handleDemoLogin}>
        Entrar como demo
      </button>
    </>
  );
}