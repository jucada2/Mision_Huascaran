import cn from '../../lib/cn'

/**
 * Interruptor sí/no. Nace con la columna de asistencia del reporte semanal (P4),
 * donde un checkbox suelto no deja claro que "no" apaga el resto de la fila.
 * Vive en `ui/` y no en la pantalla para que el interruptor de "Ver otros
 * colegios" (P10) sea exactamente el mismo control.
 */
export default function Switch({ checked = false, onChange, disabled, label, id, className, ...props }) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      {...props}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'border-brand-600 bg-brand-600' : 'border-line-strong bg-surface-100',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-surface-0 shadow transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1',
        )}
      />
    </button>
  )
}
