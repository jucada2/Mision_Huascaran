// Formato de fechas y números de la interfaz. Español, sin librería de i18n.
import dayjs from 'dayjs'
import 'dayjs/locale/es'

dayjs.locale('es')

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre',
]

/** "14 – 18 set" para el selector de semanas del reporte semanal (P4). */
export function formatearRangoSemana(semana) {
  if (!semana) return ''
  const inicio = dayjs(semana.inicio)
  const fin = dayjs(semana.fin)
  const mesInicio = MESES[inicio.month()].slice(0, 3)
  const mesFin = MESES[fin.month()].slice(0, 3)
  return inicio.month() === fin.month()
    ? `${inicio.date()} – ${fin.date()} ${mesFin}`
    : `${inicio.date()} ${mesInicio} – ${fin.date()} ${mesFin}`
}

/** "Semana 12 · 14 – 18 set" */
export const etiquetaDeSemana = (semana) =>
  semana ? `Semana ${semana.numero} · ${formatearRangoSemana(semana)}` : ''

export const formatearFecha = (valor) => (valor ? dayjs(valor).format('DD/MM/YYYY') : '—')

export const formatearFechaHora = (valor) => (valor ? dayjs(valor).format('DD/MM/YYYY HH:mm') : '—')

/** Porcentaje entero, sin decimales de más en las tarjetas. */
export const porcentaje = (parte, total) => (total ? Math.round((parte / total) * 100) : 0)
