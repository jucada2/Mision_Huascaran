import { AlertTriangle, Check, CloudOff, Info, Loader2 } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import Tooltip from '../../components/ui/Tooltip'
import useCapturaRubrica, { filaCompleta } from './useCapturaRubrica'
import { agruparNivelesRubrica, useNivelesRubrica, useProgramas } from '../../hooks/useCatalogos'
import { controlClases } from '../../components/ui/Field'
import { ESTADOS } from '../reporteSemanal/useCapturaSemanal'
import cn from '../../lib/cn'

/**
 * Rúbrica semanal (P5): la misma grilla de alumnos, con las dos dimensiones.
 *
 * RN-011: las opciones de cada selector salen del catálogo del backend filtrado
 * por el PROGRAMA del alumno —en Alfabetización, Fluidez tiene cinco niveles e
 * incluye Pre Inicio—, nunca de una lista escrita en el código.
 * RF-025 / RN-016: aquí no hay forma de crear, editar ni borrar niveles.
 */
function SelectorNivel({ fila, dimension, opciones, valor, onCambiar, soloLectura }) {
  const faltante = !valor

  return (
    <div className="flex items-center gap-1.5">
      <select
        value={valor ?? ''}
        disabled={soloLectura}
        aria-label={`${dimension} de ${fila.nombre}`}
        onChange={(e) => onCambiar(Number(e.target.value))}
        className={cn(controlClases(faltante, 'h-9 min-w-[9rem] appearance-none px-2 text-xs'))}
      >
        <option value="">Seleccionar…</option>
        {opciones.map((nivel) => (
          <option key={nivel.id_nivel_rubrica} value={nivel.id_nivel_rubrica}>
            {nivel.nombre_nivel}
          </option>
        ))}
      </select>

      {/* Descriptor oficial del nivel según el ciclo evaluado del alumno (P5). */}
      <Tooltip
        content={
          valor
            ? opciones.find((n) => n.id_nivel_rubrica === valor)?.descriptores?.[fila.ciclo_evaluado]
            : `Descriptores del ciclo ${fila.ciclo_evaluado}: ${opciones.map((n) => n.nombre_nivel).join(' · ')}`
        }
      >
        <span
          tabIndex={0}
          role="button"
          aria-label={`Descriptor de ${dimension}`}
          className="flex h-6 w-6 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-surface-100 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Info className="h-4 w-4" aria-hidden="true" />
        </span>
      </Tooltip>
    </div>
  )
}

function EstadoRubrica({ estado, completa }) {
  if (!completa) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-warning-600">
        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
        Ambas dimensiones son obligatorias
      </span>
    )
  }
  if (estado === ESTADOS.GUARDANDO) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-ink-400">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        Guardando
      </span>
    )
  }
  if (estado === ESTADOS.PENDIENTE) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-warning-600">
        <CloudOff className="h-3.5 w-3.5" aria-hidden="true" />
        Pendiente
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-success-600">
      <Check className="h-3.5 w-3.5" aria-hidden="true" />
      {estado === ESTADOS.GUARDADO ? 'Guardado' : 'Completa'}
    </span>
  )
}

export default function GrillaRubrica({ idSemana, idColegio, idGrado, soloLectura = false }) {
  const { filas, estados, incompletas, cargando, actualizarFila } = useCapturaRubrica({ idSemana, idColegio, idGrado })
  const { data: niveles = [], isLoading: cargandoNiveles } = useNivelesRubrica()
  const { data: programas = [] } = useProgramas()

  const porPrograma = agruparNivelesRubrica(niveles)
  const nombrePrograma = (id) => programas.find((p) => p.id_programa === id)?.nombre ?? '—'

  if (cargando || cargandoNiveles) {
    return (
      <Card padded={false}>
        <Skeleton variant="table" rows={8} className="p-5" />
      </Card>
    )
  }

  if (filas.length === 0) {
    return (
      <Card padded={false}>
        <EmptyState
          title="Sin estudiantes para estos filtros"
          description="Elija otro colegio o grado de sus asignaciones."
        />
      </Card>
    )
  }

  return (
    <Card
      padded={false}
      title={`${filas.length - incompletas} de ${filas.length} rúbricas completas`}
      subtitle="Fluidez y Comprensión se registran siempre juntas"
      actions={incompletas > 0 && <Badge tone="warning">{incompletas} sin completar</Badge>}
    >
      <div className="sicedu-scrollbar overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-surface-100 text-xs font-semibold uppercase tracking-wide text-ink-500">
              <th scope="col" className="sticky left-0 z-10 border-b border-line bg-surface-100 px-4 py-3 text-left">
                Estudiante
              </th>
              <th scope="col" className="border-b border-line px-3 py-3 text-left">Programa</th>
              <th scope="col" className="border-b border-line px-3 py-3 text-center">Ciclo evaluado</th>
              <th scope="col" className="border-b border-line px-3 py-3 text-left">Fluidez lectora</th>
              <th scope="col" className="border-b border-line px-3 py-3 text-left">Comprensión lectora</th>
              <th scope="col" className="border-b border-line px-3 py-3 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((fila) => {
              const completa = filaCompleta(fila)
              const opciones = porPrograma[fila.id_programa] ?? {}
              return (
                <tr
                  key={fila.id_alumno}
                  className={cn('transition-colors hover:bg-brand-50/60', !completa && 'bg-warning-100/40')}
                >
                  <th scope="row" className="sticky left-0 z-10 border-b border-line bg-surface-0 px-4 py-2 text-left font-normal">
                    <span className="block truncate text-sm font-medium text-ink-900">{fila.nombre}</span>
                    <span className="block text-xs text-ink-400">{fila.codigo}</span>
                  </th>
                  <td className="border-b border-line px-3 py-2 text-ink-700">{nombrePrograma(fila.id_programa)}</td>
                  <td className="border-b border-line px-3 py-2 text-center text-ink-700">{fila.ciclo_evaluado}</td>
                  <td className="border-b border-line px-3 py-2">
                    <SelectorNivel
                      fila={fila}
                      dimension="Fluidez"
                      opciones={opciones.Fluidez ?? []}
                      valor={fila.id_nivel_fluidez}
                      soloLectura={soloLectura}
                      onCambiar={(id) => actualizarFila(fila.id_alumno, { id_nivel_fluidez: id })}
                    />
                  </td>
                  <td className="border-b border-line px-3 py-2">
                    <SelectorNivel
                      fila={fila}
                      dimension="Comprensión"
                      opciones={opciones['Comprensión'] ?? []}
                      valor={fila.id_nivel_comprension}
                      soloLectura={soloLectura}
                      onCambiar={(id) => actualizarFila(fila.id_alumno, { id_nivel_comprension: id })}
                    />
                  </td>
                  <td className="border-b border-line px-3 py-2">
                    <EstadoRubrica estado={estados[fila.id_alumno]} completa={completa} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="border-t border-line px-4 py-3 text-xs text-ink-500">
        La rúbrica es un instrumento oficial de Misión Huascarán: sus niveles y descriptores se consultan,
        no se modifican desde el sistema.
      </p>
    </Card>
  )
}
