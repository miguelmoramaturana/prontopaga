import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/errors';

interface Props {
  onError: (message: string) => void;
}

export function LoginForm({ onError }: Props) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'No se pudo conectar con el servidor. ¿Está corriendo la API?';
      onError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h1>Iniciar sesión</h1>
      <p className="muted">Consulta de Riesgo Financiero</p>

      <label htmlFor="username">Usuario</label>
      <input
        id="username"
        autoComplete="username"
        autoFocus
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />

      <label htmlFor="password">Contraseña</label>
      <div className="field field--reveal">
        <input
          id="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="button"
          className="field__toggle"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={showPassword}
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>

      <button type="submit" className="btn" disabled={loading}>
        {loading ? 'Ingresando…' : 'Ingresar'}
      </button>

      <details className="hint">
        <summary>Credenciales de prueba</summary>
        <ul>
          <li>
            <code>admin</code> / <code>admin123</code> — puede consultar cualquier RUT
          </li>
          <li>
            <code>user</code> / <code>user123</code> — sólo su RUT (12.345.678-9)
          </li>
          <li>
            <code>ana</code> / <code>ana123</code> — sólo su RUT (9.876.543-3)
          </li>
        </ul>
      </details>
    </form>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 10.7a3 3 0 0 0 4.2 4.2M9.9 5.2A9.8 9.8 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.6 4.4M6.1 6.2A17 17 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 4.1-.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
