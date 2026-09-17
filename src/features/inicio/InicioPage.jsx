// Cubre: RF-004, RF-002, RN-001, RN-003, RN-006, RNF-006
import { BookOpen, CalendarCheck, ClipboardList, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import AccesosRapidos from './AccesosRapidos'
import TarjetaAsignaciones from './TarjetaAsignaciones'
import useResumenDocente from './useResumenDocente'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import Skeleton from '../../components/ui/Skeleton'
import StatCard from '../../components/ui/StatCard'
import { usePeriodos } from '../../hooks/useCatalogos'
import useFiltrosStore from '../../store/filtrosStore'
import useSessionStore from '../../store/sessionStore'
import { formatearRangoSemana } from '../../lib/format'

const saludo = () => {
  const hora = dayjs().hour()
  if (hora < 12) return 'Buenos días'
  return hora < 19 ? 'Buenas tardes' : 'Buenas noches'
}

export default function InicioPage() {
  const usuario = useSessionStore((s) => s.usuario)
  const idPeriodo = useFiltrosStore((s) => s.idPeriodo)
  const { data: periodos = [] } = usePeriodos()
  const { data: resumen, isLoading, semanaActual } = useResumenDocente()

  const periodo = periodos.find((p) => p.id_periodo === idPeriodo)
  const primerNombre = usuario?.nombres?.split(' ')[0] ?? ''

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-ink-900 md:text-3xl">
          {saludo()}, {primerNombre}
        </h1>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-500">
          Periodo de evaluación
          <Badge tone={periodo?.estado === 'abierto' ? 'success' : 'neutral'}>
            {periodo ? `${periodo.nombre} ${periodo.anio}` : '—'}
          </Badge>
          {semanaActual && <span>· Semana {semanaActual.numero} · {formatearRangoSemana(semanaActual)}</span>}
        </p>
      </header>

      {/* RN-010: el corte diagnóstico está abierto y todavía falta registrarlo. */}
      {resumen?.evaluacion_abierta && resumen.evaluacion_abierta.registrados < resumen.evaluacion_abierta.total && (
        <Card className="border-warning-600/30 bg-warning-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-warning-600">
                Evaluación diagnóstica de {resumen.evaluacion_abierta.nombre} abierta
              </h2>
              <p className="mt-1 text-sm text-ink-700">
                Lleva {resumen.evaluacion_abierta.registrados} de {resumen.evaluacion_abierta.total} estudiantes
                registrados en este corte.
              </p>
            </div>
            <Link
              to="/registro-vuelo/nuevo"
              className="inline-flex h-10 shrink-0 items-center rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
            >
              Registrar evaluación
            </Link>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Users} label="Mis estudiantes" value={resumen?.mis_estudiantes ?? 0} />
          <StatCard
            icon={ClipboardList}
            label="Reporte de esta semana"
            value={`${resumen?.reporte_semana.registrados ?? 0} / ${resumen?.reporte_semana.total ?? 0}`}
            hint="Estudiantes con registro semanal"
          />
          <StatCard
            icon={BookOpen}
            label="Pendientes de rúbrica"
            value={resumen?.pendientes_rubrica ?? 0}
            hint="Sin Fluidez y Comprensión de la semana"
          />
          <StatCard
            icon={CalendarCheck}
            label="Ajustes por revisar"
            value={resumen?.ajustes_por_revisar ?? 0}
            hint="Sugerencias sin confirmar del periodo"
          />
        </div>
      )}

      <TarjetaAsignaciones asignaciones={resumen?.asignaciones ?? []} idSemana={semanaActual?.id_semana} />

      <section>
        <h2 className="text-xl font-semibold text-ink-900">Accesos rápidos</h2>
        <div className="mt-4">
          <AccesosRapidos />
        </div>
      </section>
    </div>
  )
}
