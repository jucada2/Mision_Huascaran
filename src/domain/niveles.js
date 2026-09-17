// Fuente única de verdad para la representación visual de los niveles.
// RN-012: la escala Raz-Kids se compara SIEMPRE por el campo `orden` del
// catálogo, nunca por la letra como texto ("Z2" > "aa" no es cierto en ASCII).

/** Claves internas de los niveles de rúbrica y del nivel general. */
export const NIVEL_KEYS = {
  PRE_INICIO: 'preinicio',
  INICIO: 'inicio',
  PROCESO: 'proceso',
  LOGRADO: 'logrado',
  DESTACADO: 'destacado',
}

/** Normaliza "Pre Inicio", "pre-inicio", "PRE INICIO" → "preinicio". */
export function normalizarNivel(nombre) {
  if (!nombre) return null
  return String(nombre)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '')
}

/** Clases de Tailwind (texto + fondo + borde) por nivel. Tokens `lvl` de §4.1. */
const CLASES_NIVEL = {
  preinicio: 'bg-lvl-preinicioBg text-lvl-preinicio border-lvl-preinicio/20',
  inicio: 'bg-lvl-inicioBg text-lvl-inicio border-lvl-inicio/20',
  proceso: 'bg-lvl-procesoBg text-lvl-proceso border-lvl-proceso/20',
  logrado: 'bg-lvl-logradoBg text-lvl-logrado border-lvl-logrado/20',
  destacado: 'bg-lvl-destacadoBg text-lvl-destacado border-lvl-destacado/20',
}

/** Valores hexadecimales, para las series de recharts (§4.1). */
export const COLOR_NIVEL = {
  preinicio: '#6D28D9',
  inicio: '#B3261E',
  proceso: '#946200',
  logrado: '#17795A',
  destacado: '#10428F',
}

const NEUTRO = 'bg-surface-100 text-ink-700 border-line'

export function clasesDeNivel(nombre) {
  return CLASES_NIVEL[normalizarNivel(nombre)] ?? NEUTRO
}

export function colorDeNivel(nombre) {
  return COLOR_NIVEL[normalizarNivel(nombre)] ?? '#8A94A6'
}

/**
 * Color de una letra Raz-Kids según su posición relativa en el catálogo.
 * Se usa el `orden` para repartir la escala en cinco tramos visuales; la letra
 * en sí nunca determina el color (RN-012).
 */
export function clasesDeLetraRazKids(orden, totalNiveles) {
  if (orden == null || !totalNiveles) return NEUTRO
  const tramo = Math.min(4, Math.floor((orden / totalNiveles) * 5))
  const escala = ['preinicio', 'inicio', 'proceso', 'logrado', 'destacado']
  return CLASES_NIVEL[escala[tramo]]
}

/** Compara dos niveles Raz-Kids por `orden`. Devuelve <0, 0 o >0. */
export function compararPorOrden(a, b) {
  return (a?.orden ?? 0) - (b?.orden ?? 0)
}
