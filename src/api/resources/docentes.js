import { api, resolver } from '../client'
import ENDPOINTS from '../endpoints'
import handlers from '../mock/handlers'

/** Colegios y grados que el docente tiene asignados en un periodo (RN-003). */
export const obtenerAsignaciones = (idDocente, periodo) =>
  resolver({
    mock: () => handlers.docentes.asignaciones(idDocente, { periodo }),
    real: () => api.get(ENDPOINTS.docentes.asignaciones(idDocente), { params: { periodo } }),
  })

/** Indicadores del panel del docente (P3). */
export const obtenerResumenDocente = (idDocente, { periodo, semana }) =>
  resolver({
    mock: () => handlers.docentes.resumen(idDocente, { periodo, semana }),
    real: () => api.get(ENDPOINTS.docentes.resumen(idDocente), { params: { periodo, semana } }),
  })
