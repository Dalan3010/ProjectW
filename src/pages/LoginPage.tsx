import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Footer } from "../components/Footer";
import { Logo } from "../components/Logo";
import { SuccessIcon } from "../components/icons";
import { usePageMeta } from "../hooks/usePageMeta";

type LoginState = { status: "form" } | { status: "success"; viaDemo: boolean };

export function LoginPage() {
  usePageMeta(
    "Iniciar sesión — BID",
    "Inicia sesión en BID para continuar con tus ideas de negocio.",
  );

  const [searchParams] = useSearchParams();
  const [login, setLogin] = useState<LoginState>(() =>
    searchParams.get("demo") === "1" ? { status: "success", viaDemo: true } : { status: "form" },
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setLogin({ status: "success", viaDemo: false });
  };

  const successMessage =
    login.status === "success" && login.viaDemo
      ? "Has entrado con la cuenta demo. Esta es una simulación de acceso."
      : "Bienvenido de vuelta a BID. Esta es una simulación de acceso.";

  return (
    <div className="login-page">
      <header className="login-header">
        <Logo size="lg" ariaLabel="BID — volver al inicio" />
      </header>

      <main className="login-main">
        <div className="card login-card">
          <h1 className="login-title">Bienvenido de vuelta</h1>
          <p className="login-subtitle">Inicia sesión para continuar con tus ideas de negocio.</p>

          {login.status === "form" ? (
            <div id="login-body">
              <form id="login-form" noValidate onSubmit={handleSubmit}>
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
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block auth-submit">
                  Iniciar sesión
                </button>
              </form>
              <p className="login-switch">
                ¿No tienes cuenta?{" "}
                <a href="#" onClick={(event) => event.preventDefault()}>
                  Regístrate gratis
                </a>
              </p>
              <div className="auth-divider">
                <span>o</span>
              </div>
              <button
                type="button"
                id="demo-btn"
                className="btn btn-ghost btn-block"
                onClick={() => setLogin({ status: "success", viaDemo: true })}
              >
                Entrar como demo
              </button>
            </div>
          ) : (
            <div id="login-success" className="success-state">
              <SuccessIcon />
              <h3 className="success-title">¡Sesión iniciada!</h3>
              <p className="success-text" id="success-message">
                {successMessage}
              </p>
              <Link to="/" className="btn btn-ghost">
                Volver al inicio
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
