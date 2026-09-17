import { CloudOff, RefreshCw, CheckCircle2 } from 'lucide-react'
import cn from '../../lib/cn'

/**
 * Estado de la cola de envíos pendientes (RNF-001).
 * Presentacional: recibe el estado y notifica el clic; la cola vive en IndexedDB.
 */
export default function SyncBadge({ pendientes = 0, sincronizando = false, error = false, onClick, className }) {
  const hayPendientes = pendientes > 0

  const { Icon, texto, clases } = sincronizando
    ? { Icon: RefreshCw, texto: 'Sincronizando…', clases: 'border-info-600/20 bg-info-100 text-info-600' }
    : error
      ? { Icon: CloudOff, texto: `${pendientes} sin enviar`, clases: 'border-danger-600/20 bg-danger-100 text-danger-600' }
      : hayPendientes
        ? {
            Icon: CloudOff,
            texto: `${pendientes} ${pendientes === 1 ? 'pendiente' : 'pendientes'}`,
            clases: 'border-warning-600/20 bg-warning-100 text-warning-600',
          }
        : { Icon: CheckCircle2, texto: 'Todo sincronizado', clases: 'border-success-600/20 bg-success-100 text-success-600' }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Estado de sincronización: ${texto}`}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-opacity hover:opacity-80',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1',
        clases,
        className,
      )}
    >
      <Icon className={cn('h-3.5 w-3.5', sincronizando && 'animate-spin')} aria-hidden="true" />
      <span className="hidden sm:inline">{texto}</span>
      <span className="sm:hidden tabular-nums">{hayPendientes ? pendientes : '✓'}</span>
    </button>
  )
}
