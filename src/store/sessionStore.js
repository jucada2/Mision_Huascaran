import { create } from 'zustand'

/**
 * Sesión activa.
 *
 * RNF-003: el token vive en memoria y se respalda en `sessionStorage`, NUNCA en
 * `localStorage`, de modo que no sobrevive al cierre del navegador.
 */
const CLAVE_TOKEN = 'sicedu.token'

function leerTokenInicial() {
  try {
    return sessionStorage.getItem(CLAVE_TOKEN)
  } catch {
    // Navegación privada o almacenamiento bloqueado: la sesión vive solo en memoria.
    return null
  }
}

export const useSessionStore = create((set, get) => ({
  token: leerTokenInicial(),
  usuario: null,
  cargando: true,

  setToken: (token) => {
    try {
      if (token) sessionStorage.setItem(CLAVE_TOKEN, token)
      else sessionStorage.removeItem(CLAVE_TOKEN)
    } catch {
      // Sin almacenamiento disponible el token sigue siendo válido en memoria.
    }
    set({ token })
  },

  setUsuario: (usuario) => set({ usuario }),
  setCargando: (cargando) => set({ cargando }),

  cerrarSesion: () => {
    try {
      sessionStorage.removeItem(CLAVE_TOKEN)
    } catch {
      // nada que limpiar
    }
    set({ token: null, usuario: null, cargando: false })
  },

  /** id_rol del usuario autenticado, o null. */
  rol: () => get().usuario?.id_rol ?? null,
}))

/** Acceso al token fuera de React (interceptores de axios). */
export function obtenerToken() {
  return useSessionStore.getState().token
}

export default useSessionStore
