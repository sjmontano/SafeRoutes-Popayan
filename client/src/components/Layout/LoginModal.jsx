import { useState } from 'react';
import { loginUser } from '../../utils/auth';

export default function LoginModal({ onLogin, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = loginUser(username, password);
    if (user) {
      onLogin(user);
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: 'var(--white)', border: '2px solid var(--near-black)',
        boxShadow: '6px 6px 0 #111', padding: 32, width: 340,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0 }}>Iniciar Sesión</h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: 0,
          }}>
            ✕
          </button>
        </div>

        <div style={{
          padding: '8px 10px', background: 'var(--surface-alt)', fontSize: '0.625rem',
          marginBottom: 16, letterSpacing: '0.03em',
        }}>
          <strong>Demo:</strong> admin/admin · santiago/santiago123 · sotelo/sotelo123 · luisa/luisa123
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            style={{ width: '100%' }}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%' }}
          />

          {error && (
            <div style={{ padding: '6px 10px', background: 'var(--error)', color: 'white', fontSize: '0.6875rem', fontWeight: 700 }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 4 }}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
