import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { listarRubricaSemanal } from '../../api/resources/rubrica'
import useOfflineQueue, { TIPOS_ENVIO, claveDeFila } from '../../hooks/useOfflineQueue'
import { ESTADOS } from '../reporteSemanal/useCapturaSemanal'

/**
 * Estado de la grilla de rúbrica semanal (P5).
 *
 * RN-008: Fluidez y Comprensión se registran SIEMPRE juntas. Mientras falte una
 * de las dos, la fila no se envía —ni siquiera a la cola— y se muestra en
 * advertencia. Es la única diferencia real con la captura del reporte semanal.
 */
export const filaCompleta = (fila) => Boolean(fila.id_nivel_fluidez && fila.id_nivel_comprension)

export default function useCapturaRubrica({ idSemana, idColegio, idGrado }) {
  const queryClient = useQueryClient()
  const { encolar } = useOfflineQueue()
  const [borradores, setBorradores] = useState({})
  const [estados, setEstados] = useState({})
  const montado = useRef(true)

  const claveConsulta = ['rubrica-semanal', idSemana, idColegio, idGrado]

  const consulta = useQuery({
    queryKey: claveConsulta,
    queryFn: () => listarRubricaSemanal({ semana: idSemana, colegio: idColegio, grado: idGrado }),
    enabled: Boolean(idSemana && idColegio && idGrado),
  })

  useEffect(() => {
    setBorradores({})
    setEstados({})
  }, [idSemana, idColegio, idGrado])

  useEffect(() => {
    montado.current = true
    return () => {
      montado.current = false
    }
  }, [])

  const filas = useMemo(
    () => (consulta.data ?? []).map((fila) => ({ ...fila, ...borradores[fila.id_alumno] })),
    [consulta.data, borradores],
  )

  const enviar = useCallback(
    (fila) => {
      const clave = claveDeFila(TIPOS_ENVIO.RUBRICA_SEMANAL, fila.id_alumno, fila.id_semana)
      setEstados((previos) => ({ ...previos, [fila.id_alumno]: ESTADOS.GUARDANDO }))

      encolar({
        clave,
        tipo: TIPOS_ENVIO.RUBRICA_SEMANAL,
        descripcion: `Rúbrica semanal · ${fila.nombre}`,
        payload: {
          id_alumno: fila.id_alumno,
          id_semana: fila.id_semana,
          id_nivel_fluidez: fila.id_nivel_fluidez,
          id_nivel_comprension: fila.id_nivel_comprension,
        },
      })
        .then((respuesta) => {
          if (!montado.current || respuesta?.reemplazado) return
          queryClient.setQueryData(claveConsulta, (previas = []) =>
            previas.map((f) => (f.id_alumno === respuesta.id_alumno ? respuesta : f)),
          )
          setEstados((previos) => ({ ...previos, [fila.id_alumno]: ESTADOS.GUARDADO }))
        })
        .catch(() => {
          if (!montado.current) return
          setEstados((previos) => ({ ...previos, [fila.id_alumno]: ESTADOS.PENDIENTE }))
        })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [encolar, queryClient, idSemana, idColegio, idGrado],
  )

  const actualizarFila = useCallback(
    (idAlumno, cambios) => {
      setBorradores((previos) => {
        const actualizada = { ...previos[idAlumno], ...cambios }
        const completa = { ...filas.find((f) => f.id_alumno === idAlumno), ...actualizada }
        // Se envía en cuanto están las dos dimensiones: no hay nada más que escribir.
        if (filaCompleta(completa)) enviar(completa)
        return { ...previos, [idAlumno]: actualizada }
      })
    },
    [filas, enviar],
  )

  const incompletas = filas.filter((fila) => !filaCompleta(fila)).length

  return { filas, estados, incompletas, cargando: consulta.isLoading, actualizarFila }
}
