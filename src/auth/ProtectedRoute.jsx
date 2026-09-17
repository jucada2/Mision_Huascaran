import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useSessionStore from '../store/sessionStore'
import PantallaCargando from '../components/layout/PantallaCargando'

/**
 * Primera guarda: sin token no se entra (RNF-004).
 * Guarda la ruta pedida para volver a ella después del login.
 */
export default function ProtectedRoute() {
  const token = useSessionStore((s) => s.token)
  const usuario = useSessionStore((s) => s.usuario)
  const cargando = useSessionStore((s) => s.cargando)
  const location = useLocation()

  if (cargando) return <PantallaCargando />
  if (!token || !usuario) {
    return <Navigate to="/login" replace state={{ desde: location.pathname + location.search }} />
  }
  return <Outlet />
}
