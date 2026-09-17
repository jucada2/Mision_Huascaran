import { createPortal } from 'react-dom'
import { LogOut, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import Logo from '../ui/Logo'
import useOnEscape from '../../hooks/useOnEscape'
import { useAuth } from '../../auth/AuthProvider'
import { NOMBRE_ROL } from '../../auth/roles'
import { navegacionDe } from './navegacion'
import cn from '../../lib/cn'

/**
 * Barra lateral de 248px (P2). En escritorio va fija; bajo `lg` se muestra como
 * panel deslizante con el botón hamburguesa de la barra superior (RNF-002).
 *
 * No usa el componente `Drawer` porque aquel es un panel blanco de formularios;
 * este es el menú navy y comparte con él la animación y el cierre por Escape.
 */
const ANCHO = 'w-[248px]'

function iniciales(nombre = '') {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

function Contenido({ onNavegar, onCerrar }) {
  const { usuario, salir } = useAuth()
  const items = navegacionDe(usuario?.id_rol)

  return (
    <div className="flex h-full flex-col bg-navy-900 text-white">
      <div className="flex items-center justify-between px-5 py-5">
        <Logo tone="light" size="md" />
        {onCerrar && (
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar menú"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="sicedu-scrollbar flex-1 overflow-y-auto px-3 py-2" aria-label="Menú principal">
        <ul className="flex flex-col gap-1">
          {items.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={onNavegar}
                className={({ isActive }) =>
                  cn(
                    'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 focus-visible:ring-offset-navy-900',
                    isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-brand-500" aria-hidden="true" />
                    )}
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
            {iniciales(usuario?.nombres)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{usuario?.nombres}</p>
            <p className="truncate text-xs text-white/60">{NOMBRE_ROL[usuario?.id_rol] ?? '—'}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={salir}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 focus-visible:ring-offset-navy-900"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export default function Sidebar({ abierto = false, onCerrar }) {
  useOnEscape(abierto, onCerrar)

  return (
    <>
      <aside className={cn('fixed inset-y-0 left-0 z-40 hidden lg:block', ANCHO)}>
        <Contenido />
      </aside>

      {abierto &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Cerrar menú"
              tabIndex={-1}
              onClick={onCerrar}
              className="absolute inset-0 h-full w-full cursor-default bg-navy-900/50 animate-fade-in"
            />
            <div className={cn('absolute inset-y-0 left-0 animate-slide-in-left', ANCHO)}>
              <Contenido onNavegar={onCerrar} onCerrar={onCerrar} />
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
