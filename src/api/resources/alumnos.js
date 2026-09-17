import { api, resolver } from '../client'
import ENDPOINTS from '../endpoints'
import handlers from '../mock/handlers'

/** GET /alumnos?colegio=&grado=&programa=&q= */
export const listarAlumnos = (filtros = {}) =>
  resolver({
    mock: () => handlers.alumnos.listar(filtros),
    real: () => api.get(ENDPOINTS.alumnos.listar, { params: filtros }),
  })
