// Instancia única de axios y conmutador del modo mock (§3).
//
// El resto de la aplicación nunca sabe si los datos vienen de la API o del mock:
// solo los archivos de `resources/` usan `resolver()`.
import axios from 'axios'
import useSessionStore, { obtenerToken } from '../store/sessionStore'

export const usarMock = String(import.meta.env.VITE_USE_MOCK ?? 'true') === 'true'

export const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

// RNF-003: en producción la API solo se consume por TLS.
if (import.meta.env.PROD && !usarMock && !baseURL.startsWith('https://')) {
  console.warn('[SICEDU] VITE_API_BASE_URL debe usar https en producción (RNF-003).')
}

export const api = axios.create({
  baseURL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    // RNF-003: las respuestas con datos de alumnos no se guardan en caché HTTP.
    'Cache-Control': 'no-store',
  },
})

api.interceptors.request.use((config) => {
  const token = obtenerToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    // Token vencido o inválido: se cierra la sesión y el guardado de ruta hace
    // el resto. No se reintenta: reintentar con un token muerto es inútil.
    if (error?.response?.status === 401 && !error.config?.url?.includes('/login')) {
      useSessionStore.getState().cerrarSesion()
    }
    return Promise.reject(error)
  },
)

/**
 * Punto único donde se decide mock o API real.
 * `resolver({ mock: () => handlers.x(), real: () => api.get(...) })`
 */
export async function resolver({ mock, real }) {
  if (usarMock) return mock()
  const respuesta = await real()
  return respuesta?.data
}

/** Código de estado de un error de axios (o del mock), o null si fue de red. */
export const estadoDe = (error) => error?.response?.status ?? null

export default api
