import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function Navbar() {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(10, 10, 15, 0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: 72,
        }}
        className="container"
      >
        <Link to="/" style={{ textDecoration: "none", display: "inline-flex" }}>
          <Logo size={30} />
        </Link>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link to="/login" className="btn btn-ghost navbar-btn">
            Iniciar sesión
          </Link>
          <Link to="/login" className="btn btn-primary navbar-btn">
            Comenzar gratis
          </Link>
        </div>
      </div>
    </nav>
  );
}