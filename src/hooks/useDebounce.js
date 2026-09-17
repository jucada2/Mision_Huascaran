import { useEffect, useRef, useState } from 'react'

/** Valor retrasado. Autoguardado por fila del reporte semanal usa 800ms (P4). */
export default function useDebounce(valor, ms = 800) {
  const [retrasado, setRetrasado] = useState(valor)

  useEffect(() => {
    const id = setTimeout(() => setRetrasado(valor), ms)
    return () => clearTimeout(id)
  }, [valor, ms])

  return retrasado
}

/** Versión callback: devuelve una función estable que difiere su ejecución. */
export function useDebouncedCallback(fn, ms = 800) {
  const fnRef = useRef(fn)
  const timerRef = useRef(null)
  fnRef.current = fn

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return (...args) => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => fnRef.current(...args), ms)
  }
}
