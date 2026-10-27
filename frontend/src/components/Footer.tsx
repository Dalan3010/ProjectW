import type { MouseEvent } from 'react'

const CURRENT_YEAR = new Date().getFullYear()

function preventNavigation(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault()
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <span className="footer-copy">BID © {CURRENT_YEAR}</span>
        <div className="footer-links">
          <a href="#" data-fake className="footer-link" onClick={preventNavigation}>
            Privacidad
          </a>
          <span className="footer-sep">|</span>
          <a href="#" data-fake className="footer-link" onClick={preventNavigation}>
            Términos
          </a>
          <span className="footer-sep">|</span>
          <a href="#" data-fake className="footer-link" onClick={preventNavigation}>
            Contacto
          </a>
        </div>
      </div>
    </footer>
  )
}
