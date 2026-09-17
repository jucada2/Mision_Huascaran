import { Check } from 'lucide-react'
import cn from '../../lib/cn'

/** Pasos numerados horizontales. `steps` = ['Seleccionar estudiante', …], `current` es 0-indexado. */
export default function Stepper({ steps = [], current = 0, onStepClick, className }) {
  return (
    <ol className={cn('flex w-full items-center gap-2', className)}>
      {steps.map((label, i) => {
        const completado = i < current
        const activo = i === current
        const navegable = Boolean(onStepClick) && completado

        return (
          <li key={label} className="flex min-w-0 flex-1 items-center gap-2">
            <button
              type="button"
              disabled={!navegable}
              onClick={() => navegable && onStepClick(i)}
              className={cn(
                'flex min-w-0 items-center gap-2 rounded-lg px-1 py-1 text-left',
                navegable && 'hover:bg-surface-100',
                !navegable && 'cursor-default',
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold tabular-nums',
                  completado && 'border-success-600 bg-success-600 text-white',
                  activo && 'border-brand-600 bg-brand-600 text-white',
                  !completado && !activo && 'border-line-strong bg-surface-0 text-ink-400',
                )}
              >
                {completado ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
              </span>
              <span
                className={cn(
                  'hidden truncate text-sm font-semibold sm:block',
                  activo ? 'text-ink-900' : 'text-ink-500',
                )}
              >
                {label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <span className={cn('h-px flex-1 rounded-full', completado ? 'bg-success-600' : 'bg-line')} />
            )}
          </li>
        )
      })}
    </ol>
  )
}
