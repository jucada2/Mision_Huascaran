import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { obtenerAsignaciones } from '../../api/resources/docentes'
import { useSemanas } from '../../hooks/useCatalogos'
import useFiltrosStore from '../../store/filtrosStore'
import useSessionStore from '../../store/sessionStore'

/**
 * Filtros de la pantalla de captura (P4): semana, colegio y grado.
 *
 * Viven en la URL para que el botón "Registrar" del panel del docente (P3) abra
 * la grilla ya filtrada y para que una pantalla se pueda compartir tal cual.
 * Por defecto: la semana en curso y la primera asignación del docente.
 */
export default function useFiltrosSemanales() {
  const [params, setParams] = useSearchParams()
  const idDocente = useSessionStore((s) => s.usuario?.id_docente)
  const idPeriodo = useFiltrosStore((s) => s.idPeriodo)
  const { data: semanas = [] } = useSemanas()

  const { data: asignaciones = [] } = useQuery({
    queryKey: ['asignaciones', idDocente, idPeriodo],
    queryFn: () => obtenerAsignaciones(idDocente, idPeriodo),
    enabled: Boolean(idDocente && idPeriodo),
  })

  const colegios = useMemo(() => {
    const vistos = new Map()
    asignaciones.forEach((a) => vistos.set(a.id_colegio, { id_colegio: a.id_colegio, nombre: a.colegio }))
    return [...vistos.values()]
  }, [asignaciones])

  const grados = asignaciones[0]?.grados ?? [1, 2, 3, 4, 5, 6]

  const idSemana = Number(params.get('semana')) || semanas.at(-1)?.id_semana || null
  const idColegio = Number(params.get('colegio')) || colegios[0]?.id_colegio || null
  const idGrado = Number(params.get('grado')) || grados[0] || null
  const pestana = params.get('vista') === 'rubrica' ? 'rubrica' : 'semanal'

  const cambiar = (clave, valor) => {
    const siguientes = new URLSearchParams(params)
    if (valor == null || valor === '') siguientes.delete(clave)
    else siguientes.set(clave, String(valor))
    setParams(siguientes, { replace: true })
  }

  return {
    semanas,
    colegios,
    grados,
    idSemana,
    idColegio,
    idGrado,
    pestana,
    // §5: solo edita los colegios que tiene asignados en el periodo vigente.
    puedeEditar: colegios.some((c) => c.id_colegio === idColegio),
    cargandoAsignaciones: Boolean(idDocente && idPeriodo) && asignaciones.length === 0,
    cambiar,
  }
}
