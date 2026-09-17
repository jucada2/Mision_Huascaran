import { useEffect, useState } from 'react'

/** Suscripción a un media query. Usado para colapsar filtros y barra lateral (RNF-002). */
export default function useMediaQuery(query) {
  const [coincide, setCoincide] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const alCambiar = (e) => setCoincide(e.matches)
    setCoincide(mql.matches)
    mql.addEventListener('change', alCambiar)
    return () => mql.removeEventListener('change', alCambiar)
  }, [query])

  return coincide
}

/** Puntos de quiebre de Tailwind usados en la app. */
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')
