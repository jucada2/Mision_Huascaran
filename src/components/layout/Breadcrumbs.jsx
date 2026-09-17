import { ChevronRight } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { etiquetaDeSegmento } from './navegacion'
import { rutaInicioDe } from '../../auth/roles'
import useSessionStore from '../../store/sessionStore'
import cn from '../../lib/cn'

/** Migas de pan de la barra superior: `Inicio › Registro de Vuelo › Detalle` (P2). */
export default function Breadcrumbs({ className }) {
  const { pathname } = useLocation()
  const idRol = useSessionStore((s) => s.usuario?.id_rol)
  const inicio = rutaInicioDe(idRol)

  const segmentos = pathname.split('/').filter(Boolean)
  const migas = segmentos.map((segmento, i) => ({
    to: `/${segmentos.slice(0, i + 1).join('/')}`,
    label: etiquetaDeSegmento(segmento),
  }))

  // La primera miga siempre es el inicio del rol; si ya lo es, no se duplica.
  const completas = migas[0]?.to === inicio ? migas : [{ to: inicio, label: 'Inicio' }, ...migas]

  return (
    <nav aria-label="Ruta de navegación" className={cn('min-w-0', className)}>
      <ol className="flex items-center gap-1 text-sm">
        {completas.map((miga, i) => {
          const ultima = i === completas.length - 1
          return (
            <li key={miga.to} className={cn('flex min-w-0 items-center gap-1', !ultima && 'hidden sm:flex')}>
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden="true" />}
              {ultima ? (
                <span className="truncate font-semibold text-ink-900" aria-current="page">
                  {miga.label}
                </span>
              ) : (
                <Link
                  to={miga.to}
                  className="truncate text-ink-500 transition-colors hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
                >
                  {miga.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
