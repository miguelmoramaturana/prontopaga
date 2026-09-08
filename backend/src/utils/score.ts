import { normalizeRut } from './rut';

/**
 * Score financiero determinista en el rango [0, 100].
 *
 * Se calcula con un hash FNV-1a de 32 bits sobre el RUT normalizado:
 *  - el mismo RUT devuelve siempre el mismo score,
 *  - RUTs distintos se reparten de forma pseudo-aleatoria en el rango.
 *
 * No usa fecha, aleatoriedad ni estado: es una función pura.
 */
export function computeScore(rut: string): number {
  const key = normalizeRut(rut);
  let hash = 0x811c9dc5; // offset basis FNV-1a
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193); // prime FNV-1a
  }
  return (hash >>> 0) % 101; // 0..100 inclusive
}
