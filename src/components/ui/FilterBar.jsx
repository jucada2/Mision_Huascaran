import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import Button from './Button'
import Drawer from './Drawer'
import cn from '../../lib/cn'
import { useIsDesktop } from '../../hooks/useMediaQuery'

/**
 * Fila de filtros + buscador + "Aplicar filtros".
 * RNF-002: bajo `lg` el conjunto colapsa en un Drawer para no romper el ancho.
 */
export default function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Buscar…',
  onApply,
  onClear,
  activeCount = 0,
  className,
  children,
}) {
  const esEscritorio = useIsDesktop()
  const [abierto, setAbierto] = useState(false)

  const buscador = onSearchChange && (
    <div className="relative min-w-0 flex-1 lg:max-w-xs">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
        aria-hidden="true"
      />
      <input
        type="search"
        value={search ?? ''}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
        aria-label={searchPlaceholder}
        className="h-10 w-full rounded-lg border border-line-strong bg-surface-0 pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
      />
    </div>
  )

  const acciones = (
    <div className="flex flex-wrap items-center gap-2">
      {onClear && (
        <Button variant="ghost" size="md" iconLeft={X} onClick={onClear}>
          Limpiar
        </Button>
      )}
      {onApply && (
        <Button variant="primary" size="md" onClick={onApply}>
          Aplicar filtros
        </Button>
      )}
    </div>
  )

  if (esEscritorio) {
    return (
      <div
        className={cn(
          'rounded-xl border border-line bg-surface-0 p-4 shadow-card',
          className,
        )}
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 xl:grid-cols-4 2xl:grid-cols-5">
            {children}
          </div>
          {buscador}
          {acciones}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {buscador}
      <Button
        variant="outline"
        size="md"
        iconLeft={SlidersHorizontal}
        onClick={() => setAbierto(true)}
        className="shrink-0"
      >
        Filtros
        {activeCount > 0 && (
          <span className="ml-1 rounded-full bg-brand-100 px-1.5 text-xs font-bold tabular-nums text-brand-700">
            {activeCount}
          </span>
        )}
      </Button>

      <Drawer
        open={abierto}
        onClose={() => setAbierto(false)}
        title="Filtros"
        footer={
          <>
            {onClear && (
              <Button variant="ghost" onClick={onClear}>
                Limpiar
              </Button>
            )}
            <Button
              variant="primary"
              onClick={() => {
                onApply?.()
                setAbierto(false)
              }}
            >
              Aplicar filtros
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">{children}</div>
      </Drawer>
    </div>
  )
}
