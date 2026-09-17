import { ArrowRight, ClipboardCheck, ClipboardList, Plane } from 'lucide-react'
import { Link } from 'react-router-dom'

/** Los tres accesos que el docente usa todas las semanas (P3). */
const ACCESOS = [
  {
    to: '/reporte-semanal',
    icon: ClipboardList,
    titulo: 'Reporte semanal',
    descripcion: 'Asistencia, libros y observación de la semana en curso.',
  },
  {
    to: '/registro-vuelo',
    icon: Plane,
    titulo: 'Registro de vuelo',
    descripcion: 'Evaluaciones diagnósticas de abril, julio, octubre y diciembre.',
  },
  {
    to: '/nivel-final',
    icon: ClipboardCheck,
    titulo: 'Nivel final',
    descripcion: 'Revisar el nivel calculado del mes y ajustarlo con justificación.',
  },
]

export default function AccesosRapidos() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {ACCESOS.map(({ to, icon: Icon, titulo, descripcion }) => (
        <Link
          key={to}
          to={to}
          className="group rounded-xl border border-line bg-surface-0 p-5 shadow-card transition-colors hover:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="mt-4 flex items-center gap-1.5 text-base font-semibold text-ink-900">
            {titulo}
            <ArrowRight
              className="h-4 w-4 text-brand-600 opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden="true"
            />
          </h3>
          <p className="mt-1 text-sm text-ink-500">{descripcion}</p>
        </Link>
      ))}
    </div>
  )
}
