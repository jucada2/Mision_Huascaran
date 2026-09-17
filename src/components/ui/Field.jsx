import cn from '../../lib/cn'

/**
 * Envoltura común de los controles de formulario: etiqueta, asterisco de
 * obligatorio, texto de ayuda, error y contador de caracteres.
 * No se usa directamente en las páginas; la consumen Input, Select y Textarea.
 */
export default function Field({
  id,
  label,
  hint,
  error,
  required,
  counter,
  className,
  children,
}) {
  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-ink-400">
          {label}
          {required && <span className="ml-0.5 text-danger-600" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {error ? (
            <p className="text-xs font-medium text-danger-600">{error}</p>
          ) : (
            hint && <p className="text-xs text-ink-400">{hint}</p>
          )}
        </div>
        {counter && (
          <span className="shrink-0 text-xs tabular-nums text-ink-400">{counter}</span>
        )}
      </div>
    </div>
  )
}

/** Clases compartidas por input / select / textarea. */
export function controlClases(error, extra) {
  return cn(
    'w-full rounded-lg border bg-surface-0 px-3 text-sm text-ink-900 placeholder:text-ink-400',
    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1',
    'disabled:cursor-not-allowed disabled:bg-surface-100 disabled:text-ink-500',
    error ? 'border-danger-500' : 'border-line-strong hover:border-ink-400',
    extra,
  )
}
