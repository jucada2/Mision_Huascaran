import { Navigate, Outlet } from 'react-router-dom'
import useSessionStore from '../store/sessionStore'
import PantallaCargando from '../components/layout/PantallaCargando'

/**
 * Segunda guarda: el rol correcto o /403 (RNF-004).
 *
 * Esto es lo que bloquea de verdad el acceso cruzado. Ocultar el enlace del menú
 * no cuenta: un usuario que escriba la URL a mano llega hasta aquí igual.
 */
export default function RoleRoute({ allow = [] }) {
  const usuario = useSessionStore((s) => s.usuario)
  const cargando = useSessionStore((s) => s.cargando)

  if (cargando) return <PantallaCargando />
  if (!usuario) return <Navigate to="/login" replace />
  if (!allow.includes(usuario.id_rol)) return <Navigate to="/403" replace />
  return <Outlet />
}
