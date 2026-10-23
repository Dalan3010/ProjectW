import { Link } from "react-router-dom";
import { Logo } from "./Logo";

export function Navbar() {
  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Logo />
        <div className="navbar-actions">
          <Link to="/login" className="btn btn-ghost navbar-btn">
            Iniciar sesión
          </Link>
          <Link to="/login?demo=1" className="btn btn-primary navbar-btn">
            Comenzar gratis
          </Link>
        </div>
      </div>
    </nav>
  );
}
