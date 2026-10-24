import { useState } from 'react';
import { AppNavbar } from '../components/AppNavbar';
import { Footer } from '../components/Footer';
import { Icon } from '../components/Icon';
import { useAuth } from '../context/auth-context';
import { usePageMeta } from '../hooks/usePageMeta';

export function ProfilePage() {
  usePageMeta('Administrar usuario — BID', 'Gestiona la información de tu cuenta en BID.');

  const { session } = useAuth();
  const [name, setName] = useState(session?.name || 'Usuario Demo');
  const [email] = useState(session?.email || 'demo@bid.local');
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    // Aquí puedes integrar la lógica real para actualizar el perfil en tu API
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <>
      <AppNavbar active="casos" />

      <main style={{ paddingBottom: '100px', minHeight: '80vh' }}>
        <div className="page">
          <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
            
            <div className="page-header" style={{ marginBottom: '24px' }}>
              <div>
                <h1 className="page-title">Administrar usuario</h1>
                <p className="page-subtitle">Actualiza los datos de tu perfil personal.</p>
              </div>
            </div>

            <div style={{
              backgroundColor: '#18181b',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
            }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#8b5cf6',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  {name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ color: 'white', fontSize: '18px', marginBottom: '4px' }}>{name}</h3>
                  <p style={{ color: '#a1a1aa', fontSize: '13px' }}>{email}</p>
                </div>
              </div>

              {saved && (
                <div style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid #22c55e',
                  color: '#22c55e',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Icon name="check" size={18} />
                  ¡Cambios guardados exitosamente!
                </div>
              )}

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#e4e4e7', marginBottom: '8px' }}>
                    Nombre completo
                  </label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#27272a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#e4e4e7', marginBottom: '8px' }}>
                    Correo electrónico
                  </label>
                  <input 
                    type="email" 
                    value={email}
                    disabled
                    style={{
                      width: '100%',
                      backgroundColor: '#27272a',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      color: '#71717a',
                      fontSize: '14px',
                      cursor: 'not-allowed'
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#71717a', marginTop: '4px', display: 'block' }}>
                    El correo electrónico no se puede modificar.
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button type="submit" className="btn btn-primary">
                    Guardar cambios
                  </button>
                </div>
              </form>

            </div>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}