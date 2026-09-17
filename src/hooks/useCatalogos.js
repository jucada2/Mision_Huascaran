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

/** Niveles de rúbrica del programa del alumno (P5). Sin programa no consulta. */
export const useNivelesRubrica = (idPrograma) =>
  useCatalogo(['catalogo', 'niveles-rubrica', idPrograma ?? 'todos'], () => obtenerNivelesRubrica(idPrograma), {
    enabled: idPrograma != null,
  })
