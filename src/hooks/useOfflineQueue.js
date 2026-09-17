// Punto de entrada de la cola offline para los componentes (RNF-001).
// Registra qué recurso atiende cada tipo de envío y expone el estado que pintan
// el SyncBadge y las filas del reporte semanal.
import { useEffect } from 'react'
import { encolar, iniciarCola, registrarEnviador, reintentarAhora } from '../lib/colaOffline'
import { guardarReporteSemanal } from '../api/resources/semanal'
import { guardarRubricaSemanal } from '../api/resources/rubrica'
import useSyncStore from '../store/syncStore'

export const TIPOS_ENVIO = {
  REPORTE_SEMANAL: 'reporte-semanal',
  RUBRICA_SEMANAL: 'rubrica-semanal',
}

registrarEnviador(TIPOS_ENVIO.REPORTE_SEMANAL, guardarReporteSemanal)
registrarEnviador(TIPOS_ENVIO.RUBRICA_SEMANAL, guardarRubricaSemanal)

/** Clave de idempotencia de una fila de captura: `alumno-semana` (RNF-001). */
export const claveDeFila = (tipo, idAlumno, idSemana) => `${tipo}:${idAlumno}-${idSemana}`

export default function useOfflineQueue() {
  const pendientes = useSyncStore((s) => s.pendientes)
  const sincronizando = useSyncStore((s) => s.sincronizando)
  const ultimoError = useSyncStore((s) => s.ultimoError)
  const items = useSyncStore((s) => s.items)

  useEffect(() => {
    iniciarCola()
  }, [])

  return { pendientes, sincronizando, ultimoError, items, encolar, reintentarAhora }
}
