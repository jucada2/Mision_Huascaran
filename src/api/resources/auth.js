// Dominio de autenticación (§3). Las tres rutas confirmadas por el backend.
import { api, resolver } from '../client'
import ENDPOINTS from '../endpoints'
import handlers from '../mock/handlers'
import { obtenerToken } from '../../store/sessionStore'

/** POST /login → { access_token, token_type }. Un 401 significa credenciales inválidas. */
export function iniciarSesion({ correo, password }) {
  return resolver({
    mock: () => handlers.auth.login({ correo, password }),
    real: () => api.post(ENDPOINTS.auth.login, { correo, password }),
  })
}

/** GET /me → perfil del usuario autenticado. */
export function obtenerPerfil() {
  return resolver({
    mock: () => handlers.auth.me(obtenerToken()),
    real: () => api.get(ENDPOINTS.auth.me),
  })
}

/**
 * POST /logout. Es opcional en el backend (JWT stateless): si falla, el cierre
 * de sesión del cliente igual se completa borrando el token.
 */
export function cerrarSesionEnServidor() {
  return resolver({
    mock: () => handlers.auth.logout(),
    real: () => api.post(ENDPOINTS.auth.logout),
  }).catch(() => ({ ok: false }))
}
