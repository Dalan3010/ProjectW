import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import LoginForm from "../components/LoginForm";
import Footer from "../components/Footer";

export default function Login() {
  return (
    <div className="login-page">
      <header style={{ paddingTop: 64, position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Link to="/" style={{ textDecoration: "none" }} aria-label="BID — volver al inicio">
            <Logo size={44} />
          </Link>
        </div>
      </header>
      <main
        style={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingInline: 24,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="card login-card" style={{ maxWidth: 420, width: "100%" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              margin: "0 0 8px",
            }}
          >
            Bienvenido de vuelta
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.95rem",
              margin: "0 0 28px",
            }}
          >
            Inicia sesión para continuar con tus ideas de negocio.
          </p>
          <LoginForm />
        </div>
      </main>
      <div style={{ paddingTop: 48, position: "relative", zIndex: 1 }}>
        <Footer />
      </div>
    </div>
  );
}