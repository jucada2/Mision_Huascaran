// Los handlers son el contrato con el que se construyen las pantallas mientras
// el backend se termina: si su forma cambia, las pantallas se rompen calladas.
import { describe, expect, it } from 'vitest'
import handlers from '../handlers'
import * as db from '../db'

const DOCENTE = db.USUARIOS.find((u) => u.id_rol === 1)

describe('auth', () => {
  it('devuelve un token con las credenciales correctas', async () => {
    const respuesta = await handlers.auth.login({ correo: DOCENTE.correo, password: db.CLAVE_DEMO })
    expect(respuesta.token_type).toBe('bearer')
    const perfil = await handlers.auth.me(respuesta.access_token)
    expect(perfil).toMatchObject({ id_rol: 1, correo: DOCENTE.correo })
    expect(perfil).not.toHaveProperty('password')
  })

  it('responde 401 sin distinguir correo de contraseña', async () => {
    await expect(handlers.auth.login({ correo: DOCENTE.correo, password: 'incorrecta' })).rejects.toMatchObject({
      response: { status: 401 },
    })
    await expect(handlers.auth.login({ correo: 'nadie@sicedu.test', password: db.CLAVE_DEMO })).rejects.toMatchObject({
      response: { status: 401 },
    })
  })
})

describe('panel del docente (P3)', () => {
  it('resume sus asignaciones, su avance semanal y el corte abierto', async () => {
    const resumen = await handlers.docentes.resumen(DOCENTE.id_docente, {
      periodo: db.PERIODO_VIGENTE.id_periodo,
      semana: db.SEMANA_ACTUAL.id_semana,
    })

    expect(resumen.mis_estudiantes).toBeGreaterThan(0)
    expect(resumen.reporte_semana.registrados).toBeLessThanOrEqual(resumen.reporte_semana.total)
    // RN-003: dos colegios con sus seis grados cada uno.
    expect(resumen.asignaciones).toHaveLength(12)
    expect(resumen.evaluacion_abierta).toMatchObject({ nombre: db.PERIODO_VIGENTE.nombre })
  })
})

describe('captura semanal (P4/P5)', () => {
  const filtros = { semana: db.SEMANA_ACTUAL.id_semana, colegio: 1, grado: 1 }

  it('trae una fila por alumno, con sus columnas de referencia bloqueadas', async () => {
    const filas = await handlers.semanal.listar(filtros)
    expect(filas.length).toBeGreaterThan(0)
    expect(filas[0]).toHaveProperty('referencia.nivel_esperado_razkids')
    expect(filas[0]).toHaveProperty('referencia.nivel_colocado')
  })

  it('sin asistencia descarta libros, sala de lectura y observación', async () => {
    const [fila] = await handlers.semanal.listar(filtros)
    const guardada = await handlers.semanal.guardar({
      id_alumno: fila.id_alumno,
      id_semana: filtros.semana,
      asistio: false,
      lsl: 3,
      libros: [{ titulo: 'X', aciertos: 1, total: 5 }],
      observacion: 'algo',
    })
    expect(guardada.lsl).toBe(0)
    expect(guardada.libros).toHaveLength(0)
    expect(guardada.observacion).toBe('')
  })

  it('rechaza una rúbrica con una sola dimensión (RN-008)', async () => {
    const [fila] = await handlers.rubrica.listar(filtros)
    await expect(
      handlers.rubrica.guardar({
        id_alumno: fila.id_alumno,
        id_semana: filtros.semana,
        id_nivel_fluidez: 1,
        id_nivel_comprension: null,
      }),
    ).rejects.toMatchObject({ response: { status: 422 } })
  })
})
