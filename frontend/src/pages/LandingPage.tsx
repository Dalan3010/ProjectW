import { Link } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { LandingNavbar } from '../components/LandingNavbar'
import { ZodiacBackground } from '../components/ZodiacBackground'
import { usePageMeta } from '../hooks/usePageMeta'

export function LandingPage() {
  usePageMeta(
    'BID — De la idea al negocio',
    'Convierte tus ideas en oportunidades de negocio con ayuda de inteligencia artificial.',
  )

  return (
    <>
      <ZodiacBackground />
      <LandingNavbar />

      <main>
        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-title animate-fade-up" style={{ animationDelay: '0.1s' }}>
              De la idea <span className="gradient">al negocio</span>
            </h1>
            <p className="hero-subtitle animate-fade-up" style={{ animationDelay: '0.2s' }}>
              Convierte tus ideas en oportunidades de negocio con ayuda de inteligencia
              artificial.
            </p>

            {/* Flecha animada apuntando hacia abajo con SVG directo */}
            <div
              role="button"
              tabIndex={0}
              aria-label="Ir a la sección cómo funciona"
              onClick={() => {
                const nextSection = document.getElementById('como-funciona');
                if (nextSection) {
                  nextSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '40px',
                marginLeft: 'auto',
                marginRight: 'auto',
                color: '#ffffff',
                cursor: 'pointer',
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                animation: 'bounceArrow 2s infinite',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}
              title="Descubre más"
            >
              <svg
                aria-hidden="true"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>

            <style>{`
              @keyframes bounceArrow {
                0%, 20%, 50%, 80%, 100% {
                  transform: translateY(0);
                }
                40% {
                  transform: translateY(8px);
                }
                60% {
                  transform: translateY(4px);
                }
              }
            `}</style>
          </div>
        </section>

        <section className="section" id="como-funciona">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">¿Cómo funciona?</h2>
              <p className="section-subtitle">
                Tres pasos simples para pasar de una idea a una oportunidad de negocio.
              </p>
            </div>
            <div className="how-grid">
              <div className="card">
                <div className="icon-circle">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 12a8 8 0 0 1-8 8H4l2.5-2.5A8 8 0 1 1 21 12Z" />
                  </svg>
                </div>
                <h3 className="card-title">1. Cuéntanos tu idea</h3>
                <p className="card-text">
                  Describe tu idea en pocas palabras y deja que el proceso comience.
                </p>
              </div>
              <div className="card">
                <div className="icon-circle">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
                <h3 className="card-title">2. Analizamos la oportunidad</h3>
                <p className="card-text">
                  Nuestro sistema estudia el mercado, la demanda y la viabilidad.
                </p>
              </div>
              <div className="card">
                <div className="icon-circle">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M9 18h6" />
                    <path d="M10 22h4" />
                    <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V17h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2Z" />
                  </svg>
                </div>
                <h3 className="card-title">3. Obtén una idea de negocio</h3>
                <p className="card-text">Recibe una propuesta clara y accionable para empezar.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="beneficios">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">¿Por qué BID?</h2>
              <p className="section-subtitle">
                Beneficios claros para quienes quieren emprender con confianza.
              </p>
            </div>
            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="icon-circle icon-circle-sm">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M13 2 4.5 12.5H11L9.5 22 19 10h-6.5L13 2Z" />
                  </svg>
                </div>
                <h3 className="benefit-title">Análisis rápido</h3>
                <p className="benefit-text">Resultados en minutos, no en semanas.</p>
              </div>
              <div className="benefit-card">
                <div className="icon-circle icon-circle-sm">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 3v18h18" />
                    <rect x="7" y="12" width="3" height="6" rx="1" />
                    <rect x="12" y="8" width="3" height="10" rx="1" />
                    <rect x="17" y="5" width="3" height="13" rx="1" />
                  </svg>
                </div>
                <h3 className="benefit-title">Ideas basadas en datos</h3>
                <p className="benefit-text">Decisiones respaldadas por información real.</p>
              </div>
              <div className="benefit-card">
                <div className="icon-circle icon-circle-sm">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="m8.5 12.5 2.5 2.5 4.5-5" />
                  </svg>
                </div>
                <h3 className="benefit-title">Fácil de usar</h3>
                <p className="benefit-text">Sin curvas de aprendizaje complicadas.</p>
              </div>
              <div className="benefit-card">
                <div className="icon-circle icon-circle-sm">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
                    <path d="m12 12 9 5-9 5-9-5 9-5Z" />
                  </svg>
                </div>
                <h3 className="benefit-title">Todo en un solo lugar</h3>
                <p className="benefit-text">Del concepto al plan, sin cambiar de herramienta.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="cta-card">
              <h2 className="cta-title">¿Tienes una idea?</h2>
              <p className="cta-text">
                Descubre cómo convertirla en una oportunidad de negocio.
              </p>
              <Link to="/login" className="btn btn-primary btn-lg">
                Comenzar ahora
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}