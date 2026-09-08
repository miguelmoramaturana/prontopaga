/**
 * Formato de RUT chileno para la vista. Refleja `formatRut` del backend:
 * el último carácter siempre es el dígito verificador.
 */

/** Deja sólo dígitos y K, en mayúscula, y acota al largo máximo de un RUT. */
function clean(value: string): string {
  return value
    .replace(/[^\dkK]/g, '')
    .toUpperCase()
    .slice(0, 9);
}

/** "123456789" -> "12.345.678-9". Formatea también entradas parciales. */
export function formatRut(value: string): string {
  const raw = clean(value);
  if (raw.length <= 1) return raw;
  const body = raw.slice(0, -1);
  const dv = raw.slice(-1);
  const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${withDots}-${dv}`;
}
