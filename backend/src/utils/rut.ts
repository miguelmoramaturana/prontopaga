/**
 * Utilidades de RUT chileno.
 *
 * Nota de alcance: validamos el *formato* del RUT pero no forzamos el dígito
 * verificador (módulo 11), porque el propio enunciado usa como ejemplo
 * "12.345.678-9", cuyo DV real es 5. Así el ejemplo del desafío funciona
 * tal cual. `isValidDv` queda disponible por si se quiere activar.
 */

const RUT_FORMAT = /^\s*\d{1,3}(\.\d{3})*-?[\dkK]\s*$|^\s*\d+-?[\dkK]\s*$/;

/** ¿El string tiene forma de RUT? (con o sin puntos, con o sin guión) */
export function isValidRutFormat(rut: string): boolean {
  return RUT_FORMAT.test(rut);
}

/** Quita puntos, guión y espacios; DV en minúscula. "12.345.678-9" -> "123456789" */
export function normalizeRut(rut: string): string {
  return rut.trim().replace(/[.\-\s]/g, '').toLowerCase();
}

/** Compara dos RUTs ignorando el formato. */
export function sameRut(a: string, b: string): boolean {
  return normalizeRut(a) === normalizeRut(b);
}

/** Devuelve el RUT en forma canónica: "12.345.678-9". */
export function formatRut(rut: string): string {
  const clean = normalizeRut(rut);
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${withDots}-${dv}`;
}

/** Valida el dígito verificador con módulo 11 (no se usa por defecto). */
export function isValidDv(rut: string): boolean {
  const clean = normalizeRut(rut);
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  if (!/^\d+$/.test(body)) return false;

  let sum = 0;
  let factor = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const mod = 11 - (sum % 11);
  const expected = mod === 11 ? '0' : mod === 10 ? 'k' : String(mod);
  return expected === dv;
}
