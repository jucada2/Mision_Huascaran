import { usarMock } from '../../api/client'
import { CLAVE_DEMO, USUARIOS } from '../../api/mock/db'
import { NOMBRE_ROL } from '../../auth/roles'

/**
 * Atajo para revisar la aplicación sin backend: lista los usuarios del mock.
 * Solo existe con `VITE_USE_MOCK=true`; con la API real este bloque no se
 * renderiza y ninguna credencial queda escrita en la interfaz.
 */
export default function CredencialesDemo({ onUsar }) {
  if (!usarMock) return null

  const porRol = [1, 2, 3].map((idRol) => USUARIOS.find((u) => u.id_rol === idRol))

  return (
    <section className="mt-8 rounded-xl border border-dashed border-line-strong bg-surface-0 p-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-400">
        Datos de prueba (modo mock)
      </h2>
      <ul className="mt-3 flex flex-col gap-1.5">
        {porRol.map((u) => (
          <li key={u.id_usuario} className="flex items-center justify-between gap-3">
            <span className="min-w-0">
              <span className="block truncate text-sm text-ink-700">{u.correo}</span>
              <span className="block text-xs text-ink-400">{NOMBRE_ROL[u.id_rol]}</span>
            </span>
            <button
              type="button"
              onClick={() => onUsar(u.correo, CLAVE_DEMO)}
              className="shrink-0 text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
            >
              Usar
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-ink-400">
        Contraseña para los tres: <span className="font-semibold text-ink-700">{CLAVE_DEMO}</span>
      </p>
    </section>
  )
}
