// Rúbrica semanal (P5). Fluidez y Comprensión se envían siempre juntas: el
// backend rechaza con 422 una fila con una sola dimensión (RN-008).
import { api, resolver } from '../client'
import ENDPOINTS from '../endpoints'
import handlers from '../mock/handlers'

export const listarRubricaSemanal = ({ semana, colegio, grado }) =>
  resolver({
    mock: () => handlers.rubrica.listar({ semana, colegio, grado }),
    real: () => api.get(ENDPOINTS.rubricaSemanal.listar, { params: { semana, colegio, grado } }),
  })

export const guardarRubricaSemanal = (fila) =>
  resolver({
    mock: () => handlers.rubrica.guardar(fila),
    real: () =>
      api.post(ENDPOINTS.rubricaSemanal.crear, fila, {
        headers: { 'Idempotency-Key': fila.idempotency_key },
      }),
  })
