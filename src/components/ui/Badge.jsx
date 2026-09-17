import cn from '../../lib/cn'

const TONOS = {
  neutral: 'bg-surface-100 text-ink-700 border-line',
  info: 'bg-info-100 text-info-600 border-info-600/20',
  success: 'bg-success-100 text-success-600 border-success-600/20',
  warning: 'bg-warning-100 text-warning-600 border-warning-600/20',
  danger: 'bg-danger-100 text-danger-600 border-danger-600/20',
}

export default function Badge({ tone = 'neutral', icon: Icon, className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        TONOS[tone],
        className,
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
      {children}
    </span>
  )
}
