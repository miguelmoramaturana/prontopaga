import { useState, type FormEvent } from 'react';
import { getScore } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/errors';
import { formatRut } from '../utils/rut';
import type { ScoreResponse } from '../types';

interface Props {
  onNotify: (kind: 'error' | 'success', message: string) => void;
}

function scoreLevel(score: number): { className: string; label: string } {
  if (score >= 70) return { className: 'good', label: 'Riesgo bajo' };
  if (score >= 40) return { className: 'mid', label: 'Riesgo medio' };
  return { className: 'bad', label: 'Riesgo alto' };
}

export function ScoreQuery({ onNotify }: Props) {
  const { token, user } = useAuth();
  const [rut, setRut] = useState(() => formatRut(user?.rut ?? ''));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoreResponse | null>(null);

  const level = result ? scoreLevel(result.score) : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await getScore(rut.trim(), token);
      setResult(data);
      onNotify('success', `Score obtenido para ${data.rut}.`);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'No se pudo conectar con el servidor.';
      onNotify('error', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h1>Consulta de Score</h1>
      {user?.role === 'user' ? (
        <p className="muted">Como usuario sólo puedes consultar tu propio RUT.</p>
      ) : (
        <p className="muted">Como admin puedes consultar cualquier RUT.</p>
      )}

      <form onSubmit={handleSubmit}>
        <label htmlFor="rut">RUT</label>
        <input
          id="rut"
          placeholder="12.345.678-9"
          inputMode="text"
          value={rut}
          onChange={(e) => setRut(formatRut(e.target.value))}
          disabled={user?.role === 'user'}
          required
        />
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Consultando…' : 'Consultar score'}
        </button>
      </form>

      {!result && !loading && (
        <p className="empty">El score aparecerá aquí tras la consulta (rango 0–100).</p>
      )}

      {result && level && (
        <div className="result">
          <div
            className={`score score--${level.className}`}
            role="img"
            aria-label={`Score ${result.score} de 100, ${level.label}`}
          >
            {result.score}
          </div>
          <dl>
            <div>
              <dt>Nivel</dt>
              <dd className={`risk risk--${level.className}`}>{level.label}</dd>
            </div>
            <div>
              <dt>RUT</dt>
              <dd>{result.rut}</dd>
            </div>
            <div>
              <dt>Fecha de consulta</dt>
              <dd>{new Date(result.fecha).toLocaleString('es-CL')}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
