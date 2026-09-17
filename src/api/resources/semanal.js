// Reporte semanal (P4). Toda la fila viaja junta —asistencia, libros, sala de
// lectura y observación— porque la unidad de guardado del docente es la fila y
// es lo que la cola offline reintenta como un solo envío (RNF-001).
//
// El contrato de §3 también declara `POST /reporte-semanal/{id}/libros` y
// `DELETE /reporte-semanal/libros/{id}`. Quedan declarados en `endpoints.js`
// para cuando el backend exija manejar los libros uno por uno; hoy el upsert de
// la fila los lleva dentro y evita quedar a medio guardar si se corta la red.
import { api, resolver } from '../client'
import ENDPOINTS from '../endpoints'
import handlers from '../mock/handlers'

export const listarReporteSemanal = ({ semana, colegio, grado }) =>
  resolver({
    mock: () => handlers.semanal.listar({ semana, colegio, grado }),
    real: () => api.get(ENDPOINTS.reporteSemanal.listar, { params: { semana, colegio, grado } }),
  })

/**
 * Alta o actualización de una fila.
 * `idempotency_key` es `alumno-semana`: el servidor debe tratar dos envíos con
 * la misma clave como el mismo registro, nunca como dos (RNF-001).
 */
export const guardarReporteSemanal = (fila) =>
  resolver({
    mock: () => handlers.semanal.guardar(fila),
    real: () =>
      api.post(ENDPOINTS.reporteSemanal.crear, fila, {
        headers: { 'Idempotency-Key': fila.idempotency_key },
      }),
  })
