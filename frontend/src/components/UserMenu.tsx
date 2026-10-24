import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Icon } from './Icon'; 
import { useAuth } from '../context/auth-context';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { session, logout } = useAuth(); 

  // Cierra el menú si haces clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitial = session?.name ? session.name.charAt(0).toUpperCase() : 'U';

  function handleLogout() {
    setIsOpen(false);
    logout();
    navigate('/login');
  }

  return (
    <>
      <div className="user-menu-container" ref={menuRef}>
        <button 
          className="user-menu-trigger" 
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          <div className="user-avatar">{userInitial}</div>
          <div className="user-info">
            <span className="user-name">{session?.name || 'Usuario'}</span>
            <span className="user-email">{session?.email || 'correo@bid.local'}</span>
          </div>
          <Icon name="expand_more" size={16} />
        </button>

        {isOpen && (
          <div className="dropdown-menu">
            <div className="dropdown-header">Mi Cuenta</div>
            
            <ul className="dropdown-list">
              <li>
                <Link to="/perfil" className="dropdown-item" onClick={() => setIsOpen(false)}>
                  <Icon name="person" size={18} />
                  Administrar usuario
                </Link>
              </li>
              <li className="dropdown-divider"></li>
              <li>
                <button className="dropdown-item text-danger" onClick={() => {
                  setIsOpen(false);
                  setShowDeleteModal(true);
                }}>
                  <Icon name="trash" size={18} />
                  Eliminar cuenta
                </button>
              </li>
              <li>
                <button className="dropdown-item" onClick={handleLogout}>
                  <Icon name="logout" size={18} />
                  Salir
                </button>
              </li>
            </ul>
          </div>
        )}

        <style>{`
          .user-menu-container {
            position: relative;
            display: inline-block;
            margin-left: 16px;
          }
          .user-menu-trigger {
            display: flex;
            align-items: center;
            gap: 10px;
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 6px 12px 6px 6px;
            border-radius: 50px;
            cursor: pointer;
            color: white;
            transition: background 0.2s ease;
          }
          .user-menu-trigger:hover {
            background: rgba(255, 255, 255, 0.05);
          }
          .user-avatar {
            width: 32px;
            height: 32px;
            background-color: #8b5cf6; 
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 14px;
          }
          .user-info {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
          }
          .user-name {
            font-size: 13px;
            font-weight: 600;
            line-height: 1.2;
          }
          .user-email {
            font-size: 11px;
            color: #a1a1aa;
          }
          .dropdown-menu {
            position: absolute;
            top: calc(100% + 8px);
            right: 0;
            width: 220px;
            background-color: #18181b; 
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
            z-index: 100;
            animation: slideDown 0.2s ease-out forwards;
          }
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .dropdown-header {
            padding: 12px 16px;
            font-size: 11px;
            font-weight: 600;
            color: #a1a1aa;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }
          .dropdown-list {
            list-style: none;
            padding: 8px 0;
            margin: 0;
          }
          .dropdown-item {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
            padding: 10px 16px;
            font-size: 13px;
            color: #e4e4e7;
            background: transparent;
            border: none;
            text-decoration: none;
            cursor: pointer;
            text-align: left;
            transition: background 0.2s ease, color 0.2s ease;
          }
          .dropdown-item:hover {
            background-color: rgba(255, 255, 255, 0.05);
            color: white;
          }
          .dropdown-item.text-danger {
            color: #ef4444;
          }
          .dropdown-item.text-danger:hover {
            background-color: rgba(239, 68, 68, 0.1);
          }
          .dropdown-divider {
            height: 1px;
            background-color: rgba(255, 255, 255, 0.05);
            margin: 8px 0;
          }
        `}</style>
      </div>

      {/* Modal corregido con estilos limpios y centrados */}
      {showDeleteModal && createPortal(
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDeleteModal(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            padding: '16px'
          }}
        >
          <div 
            role="dialog" 
            aria-modal="true"
            style={{
              backgroundColor: '#18181b',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '400px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
          >
            <div style={{ color: '#ef4444', marginBottom: '16px' }}>
              <Icon name="warning" size={32} />
            </div>
            
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'white', marginBottom: '8px' }}>
              Eliminar cuenta permanente
            </h3>
            
            <p style={{ fontSize: '14px', color: '#a1a1aa', marginBottom: '24px', lineHeight: '1.5' }}>
              ¿Estás seguro de que quieres eliminar tu cuenta? Perderás acceso a todos tus casos e historial. Esta acción no se puede deshacer.
            </p>

            <p style={{ fontSize: '13px', color: '#fbbf24', marginBottom: '24px', lineHeight: '1.5' }}>
              La eliminación de cuentas todavía no está disponible.
            </p>
            
            <style>{`
              .animated-delete-user-btn {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                overflow: hidden;
                transition: background-color 0.4s ease, border-color 0.4s ease;
                min-width: 140px;
              }
              .animated-delete-user-btn.success {
                background-color: #22c55e !important;
                border-color: #22c55e !important;
                color: white !important;
              }
              .animated-delete-user-btn .btn-content-wrapper {
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .animated-delete-user-btn .btn-icon-trash {
                transition: transform 0.3s ease;
                z-index: 2;
                display: flex;
              }
              .animated-delete-user-btn.eating .btn-icon-trash {
                animation: chompTrashUser 0.3s infinite alternate;
              }
              @keyframes chompTrashUser {
                0% { transform: scale(1) rotate(0deg); }
                100% { transform: scale(1.2) rotate(-15deg); }
              }
              .animated-delete-user-btn .btn-text-label {
                transition: all 0.5s cubic-bezier(0.5, -0.5, 0.5, 1.5);
                white-space: nowrap;
                opacity: 1;
                transform: translateX(0);
                max-width: 120px;
                margin-left: 8px;
              }
              .animated-delete-user-btn.eating .btn-text-label {
                transform: translateX(-30px) scale(0.5);
                opacity: 0;
                max-width: 0;
                margin-left: 0;
              }
              .animated-delete-user-btn .btn-icon-check {
                position: absolute;
                transform: scale(0);
                transition: transform 0.4s cubic-bezier(0.5, -0.5, 0.5, 1.5);
              }
              .animated-delete-user-btn.success .btn-icon-check {
                transform: scale(1);
              }
              .animated-delete-user-btn.success .btn-icon-trash,
              .animated-delete-user-btn.success .btn-text-label {
                opacity: 0;
                visibility: hidden;
              }
            `}</style>

            <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="btn btn-ghost" 
                onClick={() => setShowDeleteModal(false)}
                style={{ flex: 1 }}
              >
                Cancelar
              </button>
              
              <button
                type="button"
                className="btn btn-danger animated-delete-user-btn"
                disabled
                style={{ flex: 1 }}
              >
                <div className="btn-content-wrapper">
                  <div className="btn-icon-trash">
                    <Icon name="trash" size={18} />
                  </div>
                  <span className="btn-text-label">
                    Eliminar cuenta
                  </span>
                </div>
                
                <div className="btn-icon-check">
                  <Icon name="check" size={20} />
                </div>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}