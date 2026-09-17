import { ArrowDownRight, ArrowUpRight, Minus, HelpCircle } from 'lucide-react'
import cn from '../../lib/cn'

const CONFIG = {
  up: { Icon: ArrowUpRight, label: 'Mejora', clases: 'text-success-600' },
  down: { Icon: ArrowDownRight, label: 'Baja', clases: 'text-danger-600' },
  flat: { Icon: Minus, label: 'Estable', clases: 'text-ink-500' },
  unknown: { Icon: HelpCircle, label: 'Incompleto', clases: 'text-warning-600' },
}

export default function TrendIndicator({ dir = 'flat', label, value, className }) {
  const { Icon, label: porDefecto, clases } = CONFIG[dir] ?? CONFIG.flat

  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-semibold', clases, className)}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label ?? porDefecto}
      {value != null && <span className="tabular-nums font-medium">{value}</span>}
    </span>
  )
}
