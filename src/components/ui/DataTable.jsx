import { useMemo, useState } from 'react'
import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react'
import cn from '../../lib/cn'
import EmptyState from './EmptyState'
import Skeleton from './Skeleton'

/**
 * Tabla propia sobre Tailwind (el stack prohíbe librerías de tablas).
 *
 * columns: [{ key, header, align, sortable, sortValue, width, className, headerClassName, render }]
 * RNF-002: el desplazamiento horizontal vive DENTRO de la tarjeta, nunca en el body.
 */
export default function DataTable({
  columns = [],
  rows = [],
  getRowId = (row, i) => row?.id ?? i,
  loading = false,
  empty,
  paginated = true,
  pageSizeOptions = [5, 10, 25, 50],
  initialPageSize = 10,
  rowClassName,
  onRowClick,
  stickyFirstColumn = false,
  footNote,
  className,
}) {
  const [orden, setOrden] = useState({ key: null, dir: 'asc' })
  const [pagina, setPagina] = useState(1)
  const [porPagina, setPorPagina] = useState(initialPageSize)

  const ordenadas = useMemo(() => {
    if (!orden.key) return rows
    const col = columns.find((c) => c.key === orden.key)
    if (!col) return rows
    const valor = col.sortValue ?? ((row) => row[col.key])
    return [...rows].sort((a, b) => {
      const va = valor(a)
      const vb = valor(b)
      if (va == null) return 1
      if (vb == null) return -1
      const cmp =
        typeof va === 'number' && typeof vb === 'number'
          ? va - vb
          : String(va).localeCompare(String(vb), 'es', { numeric: true })
      return orden.dir === 'asc' ? cmp : -cmp
    })
  }, [rows, orden, columns])

  const total = ordenadas.length
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina))
  const paginaActual = Math.min(pagina, totalPaginas)
  const visibles = paginated
    ? ordenadas.slice((paginaActual - 1) * porPagina, paginaActual * porPagina)
    : ordenadas

  const desde = total === 0 ? 0 : (paginaActual - 1) * porPagina + 1
  const hasta = Math.min(paginaActual * porPagina, total)

  function alternarOrden(col) {
    if (!col.sortable) return
    setOrden((prev) =>
      prev.key === col.key
        ? { key: col.key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key: col.key, dir: 'asc' },
    )
    setPagina(1)
  }

  if (loading) {
    return <Skeleton variant="table" rows={5} className={cn('p-5', className)} />
  }

  if (total === 0) {
    return (
      empty ?? (
        <EmptyState
          title="Sin registros"
          description="No hay datos para los filtros seleccionados."
        />
      )
    )
  }

  return (
    <div className={className}>
      <div className="sicedu-scrollbar overflow-x-auto">
        <table className="w-full min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-surface-100">
              {columns.map((col, i) => {
                const activa = orden.key === col.key
                const Icono = !activa ? ChevronsUpDown : orden.dir === 'asc' ? ChevronUp : ChevronDown
                return (
                  <th
                    key={col.key}
                    scope="col"
                    style={col.width ? { width: col.width } : undefined}
                    aria-sort={activa ? (orden.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                    className={cn(
                      'whitespace-nowrap border-b border-line px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500',
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                          ? 'text-center'
                          : 'text-left',
                      stickyFirstColumn && i === 0 && 'sticky left-0 z-10 bg-surface-100',
                      col.headerClassName,
                    )}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => alternarOrden(col)}
                        className={cn(
                          'inline-flex items-center gap-1 rounded transition-colors hover:text-ink-900',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1',
                          activa && 'text-brand-700',
                        )}
                      >
                        {col.header}
                        <Icono className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {visibles.map((row, i) => (
              <tr
                key={getRowId(row, i)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'border-b border-line transition-colors last:border-0 hover:bg-brand-50',
                  onRowClick && 'cursor-pointer',
                  typeof rowClassName === 'function' ? rowClassName(row) : rowClassName,
                )}
              >
                {columns.map((col, ci) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-3 align-middle text-ink-700',
                      col.align === 'right'
                        ? 'text-right tabular-nums'
                        : col.align === 'center'
                          ? 'text-center'
                          : 'text-left',
                      stickyFirstColumn && ci === 0 && 'sticky left-0 z-10 bg-surface-0',
                      col.className,
                    )}
                  >
                    {col.render ? col.render(row, i) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {footNote && <p className="border-t border-line px-4 py-3 text-xs text-ink-500">{footNote}</p>}

      {paginated && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
          <p className="text-xs text-ink-500">
            Mostrando <span className="font-semibold tabular-nums text-ink-700">{desde}</span> a{' '}
            <span className="font-semibold tabular-nums text-ink-700">{hasta}</span> de{' '}
            <span className="font-semibold tabular-nums text-ink-700">{total}</span>
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-ink-500">
              Por página
              <select
                value={porPagina}
                onChange={(e) => {
                  setPorPagina(Number(e.target.value))
                  setPagina(1)
                }}
                className="h-8 rounded-lg border border-line-strong bg-surface-0 px-2 text-xs text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                {pageSizeOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                className="h-8 rounded-lg border border-line-strong px-3 text-xs font-semibold text-ink-700 transition-colors hover:bg-surface-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="px-2 text-xs tabular-nums text-ink-500">
                {paginaActual} / {totalPaginas}
              </span>
              <button
                type="button"
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}
                className="h-8 rounded-lg border border-line-strong px-3 text-xs font-semibold text-ink-700 transition-colors hover:bg-surface-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
