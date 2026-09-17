import useSessionStore from '../../store/sessionStore'

/**
 * Muestra sus hijos solo si el rol activo está en `allow`.
 *
 * Ojo (RNF-004): esto es únicamente presentación. Ocultar un control NO es una
 * medida de seguridad; el bloqueo real lo hacen `RoleRoute` y la verificación de
 * rol previa a cada mutación.
 */
export default function RoleGate({ allow = [], fallback = null, children }) {
  const idRol = useSessionStore((s) => s.usuario?.id_rol ?? null)
  if (idRol == null || !allow.includes(idRol)) return fallback
  return children
}
