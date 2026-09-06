const links = ["Privacidad", "Términos", "Contacto"];

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        paddingBlock: 28,
      }}
    >
      <div className="container footer-container">
        <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          BID © 2026
        </span>
        <div
          className="footer-links"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {links.map((label, index) => (
            <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              {index > 0 && (
                <span style={{ color: "rgba(255,255,255,0.18)", fontSize: "0.9rem" }}>|</span>
              )}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="footer-link"
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                  textDecoration: "none",
                }}
              >
                {label}
              </a>
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}