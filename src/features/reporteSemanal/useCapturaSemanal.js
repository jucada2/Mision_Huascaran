import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { listarReporteSemanal } from '../../api/resources/semanal'
import useOfflineQueue, { TIPOS_ENVIO, claveDeFila } from '../../hooks/useOfflineQueue'

/**
 * Estado de la grilla de captura semanal (P4).
 *
 * La regla de oro es RNF-001: la interfaz nunca espera a la red. Al editar, la
 * fila se marca como guardada en local y el envío se delega a la cola; el estado
 * por fila ("guardando", "guardado", "pendiente") sale de lo que la cola
 * responde, no de un spinner bloqueante.
 */
const ESPERA_AUTOGUARDADO_MS = 800

export const ESTADOS = { GUARDANDO: 'guardando', GUARDADO: 'guardado', PENDIENTE: 'pendiente' }

export default function useCapturaSemanal({ idSemana, idColegio, idGrado }) {
  const queryClient = useQueryClient()
  const { encolar } = useOfflineQueue()
  const [borradores, setBorradores] = useState({})
  const [estados, setEstados] = useState({})
  const temporizadores = useRef(new Map())
  const filasRef = useRef([])
  const montado = useRef(true)

  const claveConsulta = ['reporte-semanal', idSemana, idColegio, idGrado]

  const consulta = useQuery({
    queryKey: claveConsulta,
    queryFn: () => listarReporteSemanal({ semana: idSemana, colegio: idColegio, grado: idGrado }),
    enabled: Boolean(idSemana && idColegio && idGrado),
  })

  // Al cambiar de semana, colegio o grado la grilla es otra: los borradores de la
  // anterior no deben pintarse sobre estos alumnos.
  useEffect(() => {
    setBorradores({})
    setEstados({})
  }, [idSemana, idColegio, idGrado])

  useEffect(() => {
    montado.current = true
    const pendientes = temporizadores.current
    return () => {
      montado.current = false
      pendientes.forEach((id) => clearTimeout(id))
      pendientes.clear()
    }
  }, [])

  const filas = useMemo(
    () => (consulta.data ?? []).map((fila) => ({ ...fila, ...borradores[fila.id_alumno] })),
    [consulta.data, borradores],
  )
  filasRef.current = filas

  const enviar = useCallback(
    (fila) => {
      const clave = claveDeFila(TIPOS_ENVIO.REPORTE_SEMANAL, fila.id_alumno, fila.id_semana)
      setEstados((previos) => ({ ...previos, [fila.id_alumno]: ESTADOS.GUARDANDO }))

      encolar({
        clave,
        tipo: TIPOS_ENVIO.REPORTE_SEMANAL,
        descripcion: `Reporte semanal · ${fila.nombre}`,
        payload: {
          id_alumno: fila.id_alumno,
          id_semana: fila.id_semana,
          asistio: fila.asistio,
          lsl: fila.lsl,
          libros: fila.libros,
          observacion: fila.observacion,
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
          // Se agotaron los reintentos: el dato sigue en la cola y en pantalla.
          setEstados((previos) => ({ ...previos, [fila.id_alumno]: ESTADOS.PENDIENTE }))
        })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [encolar, queryClient, idSemana, idColegio, idGrado],
  )

  const guardarAhora = useCallback(
    (idAlumno) => {
      clearTimeout(temporizadores.current.get(idAlumno))
      temporizadores.current.delete(idAlumno)
      const fila = filasRef.current.find((f) => f.id_alumno === idAlumno)
      if (fila) enviar(fila)
    },
    [enviar],
  )

  /** Cambia una fila y programa su autoguardado (P4: 800ms tras dejar de escribir). */
  const actualizarFila = useCallback(
    (idAlumno, cambios) => {
      setBorradores((previos) => {
        const base = { ...previos[idAlumno], ...cambios }
        // Sin asistencia no se pide nada más: la fila se limpia y se bloquea.
        const limpia = base.asistio === false ? { ...base, lsl: 0, libros: [], observacion: '' } : base
        return { ...previos, [idAlumno]: limpia }
      })

      clearTimeout(temporizadores.current.get(idAlumno))
      temporizadores.current.set(
        idAlumno,
        setTimeout(() => guardarAhora(idAlumno), ESPERA_AUTOGUARDADO_MS),
      )
    },
    [guardarAhora],
  )

  /** "Guardar semana": manda de una vez todas las filas tocadas. */
  const guardarTodo = useCallback(() => {
    const tocadas = Object.keys(borradores).map(Number)
    tocadas.forEach((idAlumno) => guardarAhora(idAlumno))
    return tocadas.length
  }, [borradores, guardarAhora])

  /** Acción masiva de asistencia (RNF-006). */
  const marcarAsistenciaDeTodos = useCallback(
    (asistio) => {
      filasRef.current.forEach((fila) => actualizarFila(fila.id_alumno, { asistio }))
    },
    [actualizarFila],
  )

  /** "Copiar la semana anterior" (RNF-006): trae los datos y los deja como borrador. */
  const copiarSemanaAnterior = useCallback(async () => {
    if (!idSemana || idSemana <= 1) return 0
    const anteriores = await queryClient.fetchQuery({
      queryKey: ['reporte-semanal', idSemana - 1, idColegio, idGrado],
      queryFn: () => listarReporteSemanal({ semana: idSemana - 1, colegio: idColegio, grado: idGrado }),
    })

    const copiables = anteriores.filter((f) => f.asistio != null)
    copiables.forEach((fila) =>
      actualizarFila(fila.id_alumno, {
        asistio: fila.asistio,
        lsl: fila.lsl,
        // Los libros se copian sin su id: son registros nuevos de esta semana.
        libros: fila.libros.map(({ titulo, aciertos, total }) => ({ titulo, aciertos, total })),
        observacion: fila.observacion,
      }),
    )
    return copiables.length
  }, [idSemana, idColegio, idGrado, queryClient, actualizarFila])

  const sinGuardar = Object.keys(borradores).length

  return {
    filas,
    estados,
    cargando: consulta.isLoading,
    error: consulta.error,
    sinGuardar,
    actualizarFila,
    guardarTodo,
    marcarAsistenciaDeTodos,
    copiarSemanaAnterior,
  }
}
