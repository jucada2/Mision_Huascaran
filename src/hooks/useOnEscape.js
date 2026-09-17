import { useEffect } from 'react'

/** Cierre por Escape para Modal y Drawer. */
export default function useOnEscape(activo, alCerrar) {
  useEffect(() => {
    if (!activo) return undefined
    const manejar = (e) => {
      if (e.key === 'Escape') alCerrar()
    }
    document.addEventListener('keydown', manejar)
    return () => document.removeEventListener('keydown', manejar)
  }, [activo, alCerrar])
}
