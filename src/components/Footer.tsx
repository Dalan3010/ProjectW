import type { MouseEvent } from "react";

const preventNavigation = (event: MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault();
};

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <span className="footer-copy">BID © 2026</span>
        <div className="footer-links">
          <a href="#" onClick={preventNavigation} className="footer-link">
            Privacidad
          </a>
          <span className="footer-sep">|</span>
          <a href="#" onClick={preventNavigation} className="footer-link">
            Términos
          </a>
          <span className="footer-sep">|</span>
          <a href="#" onClick={preventNavigation} className="footer-link">
            Contacto
          </a>
        </div>
      </div>
    </footer>
  );
}
