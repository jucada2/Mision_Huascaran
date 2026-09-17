// Resuelve cada endpoint contra `db.js` con un retardo de 300ms (§3), para que
// los estados de carga de la interfaz se vean como se verán con el backend real.
//
// Los errores imitan la forma de un error de axios (`error.response.status`), de
// modo que el resto de la aplicación trata igual al mock y a la API.
import * as db from './db'

const RETARDO_MS = 300

function copiar(datos) {
  return typeof structuredClone === 'function' ? structuredClone(datos) : JSON.parse(JSON.stringify(datos))
}

function responder(datos, ms = RETARDO_MS) {
  return new Promise((resolver) => setTimeout(() => resolver(copiar(datos)), ms))
}

function errorHttp(status, detail) {
  const error = new Error(detail)
  error.isAxiosError = true
  error.response = { status, data: { detail } }
  return error
}

/** Token de mentira con la forma `mock.<id_usuario>.<año lectivo>`. */
const armarToken = (idUsuario) => `mock.${idUsuario}.${db.ANIO_LECTIVO}`

function usuarioDeToken(token) {
  const idUsuario = Number(String(token ?? '').split('.')[1])
  return db.USUARIOS.find((u) => u.id_usuario === idUsuario) ?? null
}

/** El usuario que viaja al cliente nunca lleva credenciales. */
const perfilPublico = (usuario) => ({
  id_usuario: usuario.id_usuario,
  id_rol: usuario.id_rol,
  correo: usuario.correo,
  id_docente: usuario.id_docente,
  nombres: usuario.nombres,
})

/** Guardar tarda un poco más que leer: así se ve el estado "guardando" de P4. */
const RETARDO_ESCRITURA_MS = 450

/** Datos del alumno que acompañan a toda fila de captura o listado. */
function conDatosDeAlumno(alumno) {
  const colegio = db.COLEGIOS.find((c) => c.id_colegio === alumno.id_colegio)
  const ciclo = db.CICLOS.find((c) => c.id_ciclo === alumno.id_ciclo_evaluado)
  return {
    id_alumno: alumno.id_alumno,
    codigo: alumno.codigo,
    nombre: db.nombreCompleto(alumno),
    id_colegio: alumno.id_colegio,
    colegio: colegio?.nombre ?? null,
    id_grado: alumno.id_grado,
    aula: alumno.aula,
    id_programa: alumno.id_programa,
    id_ciclo_evaluado: alumno.id_ciclo_evaluado,
    ciclo_evaluado: ciclo?.nombre ?? null,
    activo: alumno.activo,
  }
}

function asignacionesConColegio(idDocente, idPeriodo) {
  return db.asignacionesDe(idDocente, idPeriodo).map((asignacion) => {
    const colegio = db.COLEGIOS.find((c) => c.id_colegio === asignacion.id_colegio)
    return {
      id_asignacion: asignacion.id_asignacion,
      id_periodo: asignacion.id_periodo,
      id_colegio: asignacion.id_colegio,
      colegio: colegio?.nombre ?? null,
      zona: colegio?.zona ?? null,
      grados: asignacion.grados,
    }
  })
}

/**
 * Indicadores del panel del docente (P3).
 *
 * TODO: "Ajustes por revisar" se cuenta aquí como las evaluaciones del periodo
 * vigente cuya sugerencia el docente todavía no confirma. El documento nombra el
 * indicador pero no lo define; hay que confirmarlo con Misión Huascarán.
 */
function resumenDelDocente(idDocente, idPeriodo, idSemana) {
  const asignaciones = asignacionesConColegio(idDocente, idPeriodo)
  const reportes = db.reporteSemanalDe(idSemana)
  const rubricas = db.rubricaSemanalDe(idSemana)
  const evaluaciones = db.EVALUACIONES.filter((e) => e.id_periodo === Number(idPeriodo))

  const detalle = asignaciones.flatMap((asignacion) =>
    asignacion.grados.map((idGrado) => {
      const alumnos = db.alumnosDe({ colegio: asignacion.id_colegio, grado: idGrado })
      return {
        id_colegio: asignacion.id_colegio,
        colegio: asignacion.colegio,
        zona: asignacion.zona,
        id_grado: idGrado,
        total: alumnos.length,
        registrados: alumnos.filter((a) => reportes.has(a.id_alumno)).length,
        sin_rubrica: alumnos.filter((a) => !rubricas.has(a.id_alumno)).length,
      }
    }),
  )

  const misAlumnos = asignaciones.flatMap((a) => db.alumnosDe({ colegio: a.id_colegio }))
  const periodo = db.PERIODOS.find((p) => p.id_periodo === Number(idPeriodo))
  const conEvaluacion = misAlumnos.filter((a) => evaluaciones.some((e) => e.id_alumno === a.id_alumno))

  return {
    id_periodo: Number(idPeriodo),
    id_semana: Number(idSemana),
    mis_estudiantes: misAlumnos.length,
    reporte_semana: {
      registrados: misAlumnos.filter((a) => reportes.has(a.id_alumno)).length,
      total: misAlumnos.length,
    },
    pendientes_rubrica: misAlumnos.filter((a) => !rubricas.has(a.id_alumno)).length,
    ajustes_por_revisar: evaluaciones.filter(
      (e) => e.estado === 'pendiente' && misAlumnos.some((a) => a.id_alumno === e.id_alumno),
    ).length,
    // RN-010: aviso cuando el corte diagnóstico está abierto y falta registrarlo.
    evaluacion_abierta:
      periodo?.estado === 'abierto'
        ? { id_periodo: periodo.id_periodo, nombre: periodo.nombre, registrados: conEvaluacion.length, total: misAlumnos.length }
        : null,
    asignaciones: detalle,
  }
}

/** Una fila de la grilla de captura semanal (P4), con sus columnas de referencia. */
function filaSemanal(alumno, guardada, idSemana) {
  return {
    ...conDatosDeAlumno(alumno),
    id_semana: Number(idSemana),
    id_reporte: guardada?.id_reporte ?? null,
    asistio: guardada?.asistio ?? null,
    lsl: guardada?.lsl ?? 0,
    libros: guardada?.libros ?? [],
    observacion: guardada?.observacion ?? '',
    referencia: db.referenciaDe(alumno),
    actualizado_en: guardada?.actualizado_en ?? null,
  }
}

function filaRubrica(alumno, guardada, idSemana) {
  return {
    ...conDatosDeAlumno(alumno),
    id_semana: Number(idSemana),
    id_rubrica: guardada?.id_rubrica ?? null,
    id_nivel_fluidez: guardada?.id_nivel_fluidez ?? null,
    id_nivel_comprension: guardada?.id_nivel_comprension ?? null,
    actualizado_en: guardada?.actualizado_en ?? null,
  }
}

/** Sin asistencia no hay nada que registrar: así está modelado en la base (P4). */
function normalizarReporte(payload) {
  const asistio = Boolean(payload.asistio)
  return {
    id_alumno: payload.id_alumno,
    id_semana: Number(payload.id_semana),
    asistio,
    lsl: asistio ? Number(payload.lsl ?? 0) : 0,
    libros: asistio ? (payload.libros ?? []) : [],
    observacion: asistio ? (payload.observacion ?? '') : '',
  }
}

export const handlers = {
  auth: {
    async login({ correo, password }) {
      const usuario = db.USUARIOS.find((u) => u.correo.toLowerCase() === String(correo ?? '').trim().toLowerCase())
      // P1: un 401 nunca revela cuál de los dos campos falló.
      if (!usuario || password !== db.CLAVE_DEMO) throw errorHttp(401, 'Credenciales inválidas')
      return responder({ access_token: armarToken(usuario.id_usuario), token_type: 'bearer' })
    },

    async me(token) {
      const usuario = usuarioDeToken(token)
      if (!usuario) throw errorHttp(401, 'No autenticado')
      return responder(perfilPublico(usuario), 150)
    },

    async logout() {
      // JWT stateless: el cierre real es borrar el token en el cliente (§3).
      return responder({ ok: true }, 80)
    },
  },

  catalogos: {
    colegios: () => responder(db.COLEGIOS),
    grados: () => responder(db.GRADOS),
    programas: () => responder(db.PROGRAMAS),
    ciclos: () => responder(db.CICLOS),
    nivelesRazkids: () => responder(db.NIVELES_RAZKIDS),
    nivelesRubrica: ({ programa } = {}) =>
      responder(
        programa ? db.NIVELES_RUBRICA.filter((n) => n.id_programa === Number(programa)) : db.NIVELES_RUBRICA,
      ),
    nivelGeneral: () => responder(db.NIVEL_GENERAL),
    esperadoPorGrado: () => responder(db.NIVEL_ESPERADO_POR_GRADO),
    periodos: () => responder(db.PERIODOS),
    semanas: () => responder(db.SEMANAS),
  },

  alumnos: {
    listar: (filtros = {}) => responder(db.alumnosDe(filtros).map(conDatosDeAlumno)),
  },

  docentes: {
    asignaciones: (idDocente, { periodo } = {}) => responder(asignacionesConColegio(idDocente, periodo)),
    resumen: (idDocente, { periodo, semana } = {}) => responder(resumenDelDocente(idDocente, periodo, semana)),
  },

  semanal: {
    listar: ({ semana, colegio, grado } = {}) => {
      const guardadas = db.reporteSemanalDe(semana)
      return responder(
        db.alumnosDe({ colegio, grado }).map((alumno) => filaSemanal(alumno, guardadas.get(alumno.id_alumno), semana)),
      )
    },
    guardar: async (payload) => {
      const alumno = db.ALUMNOS.find((a) => a.id_alumno === payload.id_alumno)
      if (!alumno) throw errorHttp(404, 'El alumno no existe')
      const guardada = db.guardarReporteSemanal(normalizarReporte(payload))
      return responder(filaSemanal(alumno, guardada, payload.id_semana), RETARDO_ESCRITURA_MS)
    },
  },

  rubrica: {
    listar: ({ semana, colegio, grado } = {}) => {
      const guardadas = db.rubricaSemanalDe(semana)
      return responder(
        db.alumnosDe({ colegio, grado }).map((alumno) => filaRubrica(alumno, guardadas.get(alumno.id_alumno), semana)),
      )
    },
    guardar: async (payload) => {
      const alumno = db.ALUMNOS.find((a) => a.id_alumno === payload.id_alumno)
      if (!alumno) throw errorHttp(404, 'El alumno no existe')
      // RN-008: Fluidez y Comprensión viajan siempre juntas.
      if (!payload.id_nivel_fluidez || !payload.id_nivel_comprension) {
        throw errorHttp(422, 'Ambas dimensiones son obligatorias')
      }
      const guardada = db.guardarRubricaSemanal(payload)
      return responder(filaRubrica(alumno, guardada, payload.id_semana), RETARDO_ESCRITURA_MS)
    },
  },
}

export default handlers
