import cn from '../../lib/cn'

function Bloque({ className }) {
  return <div className={cn('animate-pulse rounded-lg bg-surface-100', className)} />
}

/** Bloques de carga para tarjeta, tabla y gráfico (§4.5). */
export default function Skeleton({ variant = 'block', rows = 5, className }) {
  if (variant === 'table') {
    return (
      <div className={cn('space-y-2', className)} aria-hidden="true">
        <Bloque className="h-10 w-full" />
        {Array.from({ length: rows }).map((_, i) => (
          <Bloque key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className={cn('rounded-xl border border-line bg-surface-0 p-5 shadow-card', className)} aria-hidden="true">
        <Bloque className="h-3 w-24" />
        <Bloque className="mt-3 h-8 w-20" />
        <Bloque className="mt-3 h-3 w-32" />
      </div>
    )
  }

  if (variant === 'chart') {
    return (
      <div className={cn('flex h-64 items-end gap-3 px-2', className)} aria-hidden="true">
        {[60, 85, 45, 70, 95, 55].map((h, i) => (
          <Bloque key={i} className="flex-1" style={{ height: `${h}%` }} />
        ))}
      </div>
    )
  }

  return <Bloque className={cn('h-4 w-full', className)} />
}

export { Bloque as SkeletonBlock }
