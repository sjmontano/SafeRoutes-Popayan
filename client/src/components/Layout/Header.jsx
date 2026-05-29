import { useState } from 'react';
import LoginModal from './LoginModal';
import { logoutUser } from '../../utils/auth';

export default function Header({ user, onLogin, onLogout, onToggleGraph, showGraph, reportCount, activeTab, onTabChange }) {
  const [showLogin, setShowLogin] = useState(false);

  const handleLogout = () => {
    logoutUser();
    onLogout();
  };

  return (
    <>
      <header style={{
        position: 'relative', zIndex: 1000, background: 'var(--near-black)', color: 'var(--white)',
        borderBottom: '2px solid var(--primary)', padding: '0 var(--spacing-lg)', height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: 'var(--font)', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            <span style={{ color: 'var(--primary)' }}>Safe</span><span>Routes</span>
          </span>
          <span style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Popayán</span>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          {['route', 'reports', 'profile'].map(tab => (
            <button key={tab} onClick={() => onTabChange(tab)}
              style={{
                background: activeTab === tab ? 'var(--primary)' : 'transparent', color: 'var(--white)',
                border: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                padding: '6px 14px', fontSize: '0.625rem', boxShadow: 'none', letterSpacing: '0.04em',
              }}>
              {tab === 'route' ? 'Ruta' : tab === 'reports' ? `Reportes (${reportCount})` : 'Perfil'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={onToggleGraph}
            style={{
              background: showGraph ? 'var(--green)' : 'transparent', color: 'var(--white)',
              border: '2px solid var(--green)', padding: '4px 12px', fontSize: '0.5625rem',
              boxShadow: 'none', letterSpacing: '0.04em',
            }}>
            Grafo {showGraph ? 'ON' : 'OFF'}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src={user.avatar || `https://i.pravatar.cc/28?u=${user.username}`} alt=""
                style={{ width: 28, height: 28, border: '2px solid var(--primary)', objectFit: 'cover' }} />
              <span style={{ fontSize: '0.6875rem', fontWeight: 600 }}>{user.name}</span>
              <button onClick={handleLogout}
                style={{
                  background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--text-muted)',
                  padding: '3px 10px', fontSize: '0.5625rem', boxShadow: 'none', letterSpacing: '0.04em',
                }}>
                Salir
              </button>
            </div>
          ) : (
            <button onClick={() => setShowLogin(true)}
              style={{
                background: 'var(--primary)', color: 'white', border: '2px solid var(--primary)',
                padding: '5px 14px', fontSize: '0.625rem', boxShadow: 'none', letterSpacing: '0.04em',
              }}>
              Iniciar Sesión
            </button>
          )}
        </div>
      </header>

      {showLogin && (
        <LoginModal
          onLogin={(u) => { onLogin(u); setShowLogin(false); }}
          onClose={() => setShowLogin(false)}
        />
      )}
    </>
  );
}
