// Catálogos del sistema. Ninguno se hardcodea en la interfaz (RN-011, RN-012).
import { api, resolver } from '../client'
import ENDPOINTS from '../endpoints'
import handlers from '../mock/handlers'

const { catalogos } = ENDPOINTS

export const obtenerColegios = () =>
  resolver({ mock: () => handlers.catalogos.colegios(), real: () => api.get(catalogos.colegios) })

export const obtenerGrados = () =>
  resolver({ mock: () => handlers.catalogos.grados(), real: () => api.get(catalogos.grados) })

export const obtenerProgramas = () =>
  resolver({ mock: () => handlers.catalogos.programas(), real: () => api.get(catalogos.programas) })

export const obtenerNivelesRazkids = () =>
  resolver({ mock: () => handlers.catalogos.nivelesRazkids(), real: () => api.get(catalogos.nivelesRazkids) })

/** Los niveles de rúbrica dependen del programa del alumno (P5, RN-011). */
export const obtenerNivelesRubrica = (programa) =>
  resolver({
    mock: () => handlers.catalogos.nivelesRubrica({ programa }),
    real: () => api.get(catalogos.nivelesRubrica, { params: { programa } }),
  })

export const obtenerNivelGeneral = () =>
  resolver({ mock: () => handlers.catalogos.nivelGeneral(), real: () => api.get(catalogos.nivelGeneral) })

export const obtenerEsperadoPorGrado = () =>
  resolver({ mock: () => handlers.catalogos.esperadoPorGrado(), real: () => api.get(catalogos.esperadoPorGrado) })

export const obtenerPeriodos = () =>
  resolver({ mock: () => handlers.catalogos.periodos(), real: () => api.get(catalogos.periodos) })

export const obtenerSemanas = () =>
  resolver({ mock: () => handlers.catalogos.semanas(), real: () => api.get(catalogos.semanas) })
