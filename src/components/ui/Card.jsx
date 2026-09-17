import cn from '../../lib/cn'

export default function Card({ title, subtitle, actions, padded = true, className, bodyClassName, children }) {
  const tieneCabecera = title || subtitle || actions

  return (
    <section className={cn('rounded-xl border border-line bg-surface-0 shadow-card', className)}>
      {tieneCabecera && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            {title && <h3 className="truncate text-base font-semibold text-ink-900">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-ink-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn(padded && 'p-5', bodyClassName)}>{children}</div>
    </section>
  )
}
