// Consultas de catálogo con TanStack Query. Cambian poquísimo, así que se
// cachean por toda la sesión y no se vuelven a pedir al cambiar de pantalla.
import { useQuery } from '@tanstack/react-query'
import {
  obtenerColegios,
  obtenerEsperadoPorGrado,
  obtenerGrados,
  obtenerNivelGeneral,
  obtenerNivelesRazkids,
  obtenerNivelesRubrica,
  obtenerPeriodos,
  obtenerProgramas,
  obtenerSemanas,
} from '../api/resources/catalogos'

const OPCIONES_CATALOGO = { staleTime: Infinity, gcTime: Infinity }

const useCatalogo = (clave, fn, opciones) =>
  useQuery({ queryKey: clave, queryFn: fn, ...OPCIONES_CATALOGO, ...opciones })

export const useColegios = () => useCatalogo(['catalogo', 'colegios'], obtenerColegios)
export const useGrados = () => useCatalogo(['catalogo', 'grados'], obtenerGrados)
export const useProgramas = () => useCatalogo(['catalogo', 'programas'], obtenerProgramas)
export const useNivelesRazkids = () => useCatalogo(['catalogo', 'niveles-razkids'], obtenerNivelesRazkids)
export const useNivelGeneral = () => useCatalogo(['catalogo', 'nivel-general'], obtenerNivelGeneral)
export const useEsperadoPorGrado = () => useCatalogo(['catalogo', 'esperado-por-grado'], obtenerEsperadoPorGrado)
export const usePeriodos = () => useCatalogo(['catalogo', 'periodos'], obtenerPeriodos)
export const useSemanas = () => useCatalogo(['catalogo', 'semanas'], obtenerSemanas)

/**
 * Niveles de rúbrica (P5). Con `idPrograma` trae los de ese programa; sin él,
 * el catálogo completo, que es lo que necesita una grilla donde conviven
 * alumnos de Alfabetización y de Comprensión Lectora. En los dos casos las
 * opciones vienen del backend: nunca se escriben en el código (RN-011).
 */
export const useNivelesRubrica = (idPrograma) =>
  useCatalogo(['catalogo', 'niveles-rubrica', idPrograma ?? 'todos'], () => obtenerNivelesRubrica(idPrograma))

/** Agrupa el catálogo por programa y dimensión: `opciones[id_programa][dimension]`. */
export function agruparNivelesRubrica(niveles = []) {
  return niveles.reduce((mapa, nivel) => {
    const porPrograma = mapa[nivel.id_programa] ?? {}
    const porDimension = porPrograma[nivel.dimension] ?? []
    return {
      ...mapa,
      [nivel.id_programa]: { ...porPrograma, [nivel.dimension]: [...porDimension, nivel] },
    }
  }, {})
}
