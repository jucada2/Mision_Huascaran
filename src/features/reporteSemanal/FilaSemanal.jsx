import { memo } from 'react'
import { BookPlus, Check, CloudOff, Loader2, Lock } from 'lucide-react'
import LevelChip from '../../components/ui/LevelChip'
import Switch from '../../components/ui/Switch'
import { controlClases } from '../../components/ui/Field'
import { ESTADOS } from './useCapturaSemanal'
import { totalLibros } from '../../domain/totales'
import cn from '../../lib/cn'

const MAX_OBSERVACION = 500

function EstadoFila({ estado }) {
  if (estado === ESTADOS.GUARDANDO) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-ink-400">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        Guardando
      </span>
    )
  }
  if (estado === ESTADOS.GUARDADO) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-success-600">
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
        Guardado
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
  return <span className="text-xs text-ink-400">—</span>
}

/** Celda de referencia: la copia el sistema, el docente no la llena (P4). */
function CeldaReferencia({ letra, orden }) {
  return (
    <td className="border-b border-line bg-surface-100 px-3 py-2 text-center">
      <span className="inline-flex items-center gap-1">
        <Lock className="h-3 w-3 text-ink-400" aria-hidden="true" />
        <LevelChip letra={letra} orden={orden} size="sm" />
      </span>
    </td>
  )
}

function FilaSemanal({ fila, indice, estado, soloLectura, onCambiar, onAbrirLibros }) {
  const asistio = fila.asistio ?? false
  const bloqueada = soloLectura || fila.asistio === false
  const libros = fila.libros ?? []

  return (
    <tr className={cn('transition-colors hover:bg-brand-50/60', fila.asistio === false && 'bg-surface-50')}>
      <th
        scope="row"
        className="sticky left-0 z-10 border-b border-line bg-surface-0 px-4 py-2 text-left font-normal"
      >
        <span className="block truncate text-sm font-medium text-ink-900">{fila.nombre}</span>
        <span className="block text-xs text-ink-400">{fila.codigo}</span>
      </th>

      <CeldaReferencia letra={fila.referencia?.nivel_esperado_razkids} orden={fila.referencia?.orden_esperado} />
      <CeldaReferencia letra={fila.referencia?.nivel_colocado} orden={fila.referencia?.orden_colocado} />

      <td className="border-b border-line px-3 py-2 text-center">
        <Switch
          checked={asistio}
          disabled={soloLectura}
          label={`Asistencia de ${fila.nombre}`}
          onChange={(valor) => onCambiar(fila.id_alumno, { asistio: valor })}
          data-fila={indice}
          data-columna="asistencia"
        />
      </td>

      <td className="border-b border-line px-3 py-2 text-center">
        <button
          type="button"
          disabled={bloqueada}
          onClick={() => onAbrirLibros(fila)}
          data-fila={indice}
          data-columna="libros"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg border border-line-strong px-2.5 py-1.5 text-xs font-semibold transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1',
            'disabled:cursor-not-allowed disabled:opacity-50',
            libros.length > 0 ? 'bg-brand-100 text-brand-700' : 'text-ink-700 hover:bg-surface-100',
          )}
        >
          <BookPlus className="h-3.5 w-3.5" aria-hidden="true" />
          {libros.length > 0 ? `${libros.length} ${libros.length === 1 ? 'libro' : 'libros'}` : 'Agregar libro'}
        </button>
      </td>

      <td className="border-b border-line px-3 py-2 text-center">
        <input
          type="number"
          min="0"
          inputMode="numeric"
          disabled={bloqueada}
          value={fila.lsl ?? 0}
          onChange={(e) => onCambiar(fila.id_alumno, { lsl: Number(e.target.value) })}
          aria-label={`Libros de sala de lectura de ${fila.nombre}`}
          data-fila={indice}
          data-columna="lsl"
          className={cn(controlClases(false, 'h-9 w-16 text-center'))}
        />
      </td>

      <td className="border-b border-line px-3 py-2 text-center">
        <span className="inline-flex items-center gap-1 text-sm font-semibold tabular-nums text-ink-900">
          <Lock className="h-3 w-3 text-ink-400" aria-hidden="true" />
          {totalLibros(fila)}
        </span>
      </td>

      <td className="border-b border-line px-3 py-2">
        <textarea
          rows={1}
          maxLength={MAX_OBSERVACION}
          disabled={bloqueada}
          value={fila.observacion ?? ''}
          onChange={(e) => onCambiar(fila.id_alumno, { observacion: e.target.value })}
          aria-label={`Observación de ${fila.nombre}`}
          title={`${(fila.observacion ?? '').length}/${MAX_OBSERVACION}`}
          data-fila={indice}
          data-columna="observacion"
          className={cn(controlClases(false, 'min-w-[12rem] resize-y py-1.5 leading-snug'))}
        />
      </td>

      <td className="border-b border-line px-3 py-2 text-center">
        <EstadoFila estado={estado} />
      </td>
    </tr>
  )
}

export default memo(FilaSemanal)
