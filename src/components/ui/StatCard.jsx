import cn from '../../lib/cn'
import TrendIndicator from './TrendIndicator'

export default function StatCard({ icon: Icon, label, value, unit, hint, trend, className }) {
  return (
    <div className={cn('rounded-xl border border-line bg-surface-0 p-5 shadow-card', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold tabular-nums text-ink-900">
            {value}
            {unit && <span className="ml-1 text-base font-semibold text-ink-500">{unit}</span>}
          </p>
        </div>
        {Icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
      </div>
      {(hint || trend) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {trend && <TrendIndicator dir={trend.dir} label={trend.label} value={trend.value} />}
          {hint && <span className="text-xs text-ink-500">{hint}</span>}
        </div>
      )}
    </div>
  )
}
