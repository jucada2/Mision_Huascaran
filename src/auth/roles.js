// Catálogo `rol` de la base de datos (§5). Los ids son los del backend.
export const ROLES = {
  PROFESOR: 1,
  JEFA: 2,
  DIRECTIVOS: 3,
}

export const NOMBRE_ROL = {
  [ROLES.PROFESOR]: 'Profesor',
  [ROLES.JEFA]: 'Jefa del Programa de Educación',
  [ROLES.DIRECTIVOS]: 'Directivos',
}

/** Ruta de aterrizaje tras el login, por rol (P1). */
export const INICIO_POR_ROL = {
  [ROLES.PROFESOR]: '/inicio',
  [ROLES.JEFA]: '/dashboard',
  [ROLES.DIRECTIVOS]: '/panel-ejecutivo',
}

export function rutaInicioDe(idRol) {
  return INICIO_POR_ROL[idRol] ?? '/login'
}

/** Los Directivos no capturan datos: solo lectura y vistas ejecutivas (§5). */
export function esSoloLectura(idRol) {
  return idRol === ROLES.DIRECTIVOS
}
