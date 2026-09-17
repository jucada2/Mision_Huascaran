import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { cerrarSesionEnServidor, iniciarSesion, obtenerPerfil } from '../api/resources/auth'
import useSessionStore from '../store/sessionStore'

/**
 * Sesión de la aplicación: token, perfil y las dos acciones que los cambian.
 *
 * RNF-003: el token se guarda en memoria con respaldo en `sessionStorage`
 * (nunca `localStorage`); el perfil solo vive en memoria.
 */
const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const token = useSessionStore((s) => s.token)
  const usuario = useSessionStore((s) => s.usuario)
  const cargando = useSessionStore((s) => s.cargando)
  const setToken = useSessionStore((s) => s.setToken)
  const setUsuario = useSessionStore((s) => s.setUsuario)
  const setCargando = useSessionStore((s) => s.setCargando)
  const limpiarSesion = useSessionStore((s) => s.cerrarSesion)

  // Evita pedir /me dos veces con el StrictMode de desarrollo.
  const perfilPedidoPara = useRef(null)

  // Al recargar la página el token sobrevive en sessionStorage pero el perfil
  // no: se vuelve a pedir a /me antes de dejar entrar a ninguna ruta.
  useEffect(() => {
    if (!token) {
      perfilPedidoPara.current = null
      setCargando(false)
      return
    }
    if (usuario || perfilPedidoPara.current === token) return

    perfilPedidoPara.current = token
    setCargando(true)
    obtenerPerfil()
      .then((perfil) => {
        setUsuario(perfil)
        setCargando(false)
      })
      .catch(() => {
        // Token vencido o inválido: se vuelve a empezar.
        limpiarSesion()
      })
  }, [token, usuario, setUsuario, setCargando, limpiarSesion])

  const entrar = useCallback(
    async ({ correo, password }) => {
      const { access_token: accessToken } = await iniciarSesion({ correo, password })
      setToken(accessToken)
      const perfil = await obtenerPerfil()
      perfilPedidoPara.current = accessToken
      setUsuario(perfil)
      setCargando(false)
      return perfil
    },
    [setToken, setUsuario, setCargando],
  )

  const salir = useCallback(async () => {
    await cerrarSesionEnServidor()
    limpiarSesion()
    perfilPedidoPara.current = null
    // Ningún dato de alumnos queda en la caché tras cerrar sesión (RNF-003).
    queryClient.clear()
  }, [limpiarSesion, queryClient])

  const valor = useMemo(
    () => ({ token, usuario, cargando, autenticado: Boolean(token && usuario), entrar, salir }),
    [token, usuario, cargando, entrar, salir],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export default AuthProvider
