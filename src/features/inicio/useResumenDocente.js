import { useQuery } from '@tanstack/react-query'
import { obtenerResumenDocente } from '../../api/resources/docentes'
import { useSemanas } from '../../hooks/useCatalogos'
import useFiltrosStore from '../../store/filtrosStore'
import useSessionStore from '../../store/sessionStore'

/**
 * Datos del panel del docente (P3): sus asignaciones del periodo vigente y el
 * avance de la semana en curso.
 */
export default function useResumenDocente() {
  const idDocente = useSessionStore((s) => s.usuario?.id_docente)
  const idPeriodo = useFiltrosStore((s) => s.idPeriodo)
  const { data: semanas = [] } = useSemanas()
  const semanaActual = semanas.at(-1) ?? null

  const consulta = useQuery({
    queryKey: ['resumen-docente', idDocente, idPeriodo, semanaActual?.id_semana],
    queryFn: () => obtenerResumenDocente(idDocente, { periodo: idPeriodo, semana: semanaActual.id_semana }),
    enabled: Boolean(idDocente && idPeriodo && semanaActual),
  })

  return { ...consulta, semanaActual }
}
