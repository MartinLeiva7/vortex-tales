import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface AuthProps {
  onAuthSuccess: (token: string, user: { id: string; username: string }) => void;
}

export function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('Por favor, ingresa tu usuario y contraseña.');
      setLoading(false);
      return;
    }

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Algo salió mal. Inténtalo de nuevo.');
      }

      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-panel" style={styles.card}>
        <h1 className="cinzel-title" style={styles.title}>VORTEX TALES</h1>
        <p style={styles.subtitle}>
          {isLogin ? 'Ingresa a tu sesión' : 'Crea tu cuenta de explorador'}
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              placeholder="Escribe tu usuario..."
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña</label>
            <div style={styles.passwordContainer}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder="••••••••"
                style={{ ...styles.input, paddingRight: '45px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                title={showPassword ? "Ocultar Contraseña" : "Mostrar Contraseña"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="glow-btn"
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </button>
        </form>

        <div style={styles.footer}>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setShowPassword(false);
            }}
            style={styles.switchBtn}
          >
            {isLogin
              ? '¿No tienes cuenta? Regístrate aquí'
              : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
    background: 'radial-gradient(circle, rgba(13,17,26,1) 0%, rgba(7,9,14,1) 100%)',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    padding: '40px 30px',
    textAlign: 'center' as const,
    border: '1px solid rgba(0, 240, 255, 0.15)',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '900',
    color: '#fff',
    textShadow: '0 0 10px rgba(0, 240, 255, 0.3)',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    marginBottom: '30px',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    gap: '8px',
  },
  label: {
    fontSize: '0.8rem',
    fontFamily: 'var(--font-mono)',
    textTransform: 'uppercase' as const,
    color: 'var(--text-secondary)',
    letterSpacing: '1px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.95rem',
    fontFamily: 'var(--font-sans)',
    outline: 'none',
    transition: 'var(--transition-smooth)',
  },
  button: {
    marginTop: '10px',
    width: '100%',
  },
  error: {
    background: 'rgba(255, 51, 102, 0.1)',
    border: '1px solid var(--accent-red)',
    color: 'var(--accent-red)',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    marginBottom: '20px',
    textAlign: 'left' as const,
  },
  footer: {
    marginTop: '30px',
  },
  switchBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    textDecoration: 'underline',
    outline: 'none',
    transition: 'var(--transition-smooth)',
  },
  passwordContainer: {
    position: 'relative' as const,
    width: '100%',
  },
  eyeBtn: {
    position: 'absolute' as const,
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    outline: 'none',
    transition: 'var(--transition-smooth)',
  },
};
