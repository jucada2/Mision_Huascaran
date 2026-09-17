import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import cn from '../../lib/cn'

const DURACION_MS = 4000

const TONOS = {
  success: { Icon: CheckCircle2, clases: 'border-success-600/20 bg-success-100 text-success-600' },
  error: { Icon: XCircle, clases: 'border-danger-600/20 bg-danger-100 text-danger-600' },
  warning: { Icon: AlertTriangle, clases: 'border-warning-600/20 bg-warning-100 text-warning-600' },
  info: { Icon: Info, clases: 'border-info-600/20 bg-info-100 text-info-600' },
}

const ToastContext = createContext(null)

/** `const toast = useToast(); toast.success('Semana guardada')` */
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}

export function ToastProvider({ children }) {
  const [avisos, setAvisos] = useState([])
  const idRef = useRef(0)

  const cerrar = useCallback((id) => {
    setAvisos((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const push = useCallback((tone, message, description) => {
    const id = ++idRef.current
    setAvisos((prev) => [...prev, { id, tone, message, description }])
    return id
  }, [])

  const api = useMemo(
    () => ({
      push,
      cerrar,
      success: (m, d) => push('success', m, d),
      error: (m, d) => push('error', m, d),
      warning: (m, d) => push('warning', m, d),
      info: (m, d) => push('info', m, d),
    }),
    [push, cerrar],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <div
            aria-live="polite"
            className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2"
          >
            {avisos.map((a) => (
              <ToastItem key={a.id} {...a} onClose={() => cerrar(a.id)} />
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  )
}

function ToastItem({ tone = 'info', message, description, onClose }) {
  const { Icon, clases } = TONOS[tone] ?? TONOS.info

  useEffect(() => {
    const id = setTimeout(onClose, DURACION_MS)
    return () => clearTimeout(id)
  }, [onClose])

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-xl border bg-surface-0 p-4 shadow-card animate-slide-up',
        clases,
      )}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{message}</p>
        {description && <p className="mt-0.5 text-xs text-ink-700">{description}</p>}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar aviso"
        className="shrink-0 rounded-lg p-0.5 text-ink-400 transition-colors hover:text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export default ToastProvider
