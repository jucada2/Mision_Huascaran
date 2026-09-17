import cn from '../../lib/cn'

/**
 * Pestañas controladas. `items` = [{ value, label, badge }].
 * Subrayado azul en la activa (§4.5). En móvil la fila se desplaza en horizontal
 * dentro de su propio contenedor, nunca en el body (RNF-002).
 */
export default function Tabs({ items = [], value, onChange, className }) {
  return (
    <div className={cn('border-b border-line', className)}>
      <div className="sicedu-scrollbar -mb-px flex gap-1 overflow-x-auto" role="tablist">
        {items.map((item) => {
          const activa = item.value === value
          return (
            <button
              key={String(item.value)}
              type="button"
              role="tab"
              aria-selected={activa}
              onClick={() => onChange?.(item.value)}
              className={cn(
                'shrink-0 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1',
                activa
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-ink-500 hover:border-line-strong hover:text-ink-700',
              )}
            >
              {item.label}
              {item.badge != null && (
                <span
                  className={cn(
                    'ml-2 rounded-full px-1.5 py-0.5 text-[11px] tabular-nums',
                    activa ? 'bg-brand-100 text-brand-700' : 'bg-surface-100 text-ink-500',
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
