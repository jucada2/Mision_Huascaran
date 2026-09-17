import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import cn from '../../lib/cn'

/**
 * Una fila por colegio y grado asignado en el periodo vigente (P3).
 * RN-003: lo normal es que el docente tenga dos colegios y en cada uno los seis
 * grados, así que la tabla se agrupa por colegio para que se lea de un vistazo.
 */
function BarraAvance({ registrados, total }) {
  const porcentaje = total === 0 ? 0 : Math.round((registrados / total) * 100)
  const tono = porcentaje >= 90 ? 'bg-success-500' : porcentaje >= 50 ? 'bg-warning-500' : 'bg-danger-500'

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-surface-100" aria-hidden="true">
        <div className={cn('h-full rounded-full transition-all', tono)} style={{ width: `${porcentaje}%` }} />
      </div>
      <span className="text-xs tabular-nums text-ink-500">
        {registrados}/{total}
      </span>
    </div>
  )
}

export default function TarjetaAsignaciones({ asignaciones = [], idSemana }) {
  const porColegio = asignaciones.reduce((mapa, fila) => {
    const grupo = mapa.get(fila.id_colegio) ?? { colegio: fila.colegio, zona: fila.zona, grados: [] }
    grupo.grados.push(fila)
    mapa.set(fila.id_colegio, grupo)
    return mapa
  }, new Map())

  return (
    <Card
      title="Mis asignaciones"
      subtitle="Colegios y grados a su cargo en el periodo vigente"
      padded={false}
    >
      {asignaciones.length === 0 ? (
        <EmptyState
          title="Sin asignaciones en este periodo"
          description="La jefatura del programa asigna los colegios al inicio de cada periodo de evaluación."
        />
      ) : (
        <ul className="divide-y divide-line">
          {[...porColegio.entries()].map(([idColegio, grupo]) => (
            <li key={idColegio} className="p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="text-sm font-semibold text-ink-900">{grupo.colegio}</h4>
                <span className="text-xs text-ink-400">Zona {grupo.zona}</span>
              </div>

              <ul className="mt-3 flex flex-col gap-1">
                {grupo.grados.map((fila) => (
                  <li
                    key={`${idColegio}-${fila.id_grado}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-50"
                  >
                    <span className="w-20 shrink-0 text-sm font-medium text-ink-700">{fila.id_grado}.° grado</span>
                    <BarraAvance registrados={fila.registrados} total={fila.total} />
                    <Link
                      to={`/reporte-semanal?colegio=${idColegio}&grado=${fila.id_grado}&semana=${idSemana ?? ''}`}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
                    >
                      Registrar
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
