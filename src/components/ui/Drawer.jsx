import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import useOnEscape from '../../hooks/useOnEscape'
import cn from '../../lib/cn'

/**
 * Panel lateral derecho para editar sin perder la tabla de fondo (§4.5).
 * `side="left"` se usa para el menú en móvil (P2).
 */
export default function Drawer({ open, onClose, title, subtitle, footer, side = 'right', width = 'max-w-md', children }) {
  useOnEscape(open, onClose)

  useEffect(() => {
    if (!open) return undefined
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previo
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 bg-navy-900/50 animate-fade-in">
      <button
        type="button"
        aria-label="Cerrar"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'absolute inset-y-0 flex w-full flex-col bg-surface-0 shadow-drawer animate-slide-in-right',
          side === 'right' ? 'right-0' : 'left-0',
          width,
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="truncate text-base font-semibold text-ink-900">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-ink-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-surface-100 hover:text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && (
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-surface-50 px-5 py-4">
            {footer}
          </footer>
        )}
      </aside>
    </div>,
    document.body,
  )
}
