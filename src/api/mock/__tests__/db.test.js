// El mock es la base de todas las capturas de pantalla del equipo: si deja de
// cumplir §9, las demostraciones dejan de mostrar lo que el documento dice.
import { describe, expect, it } from 'vitest'
import * as db from '../db'

describe('catálogos del mock (§9)', () => {
  it('tiene la escala Raz-Kids completa, de aa a Z2', () => {
    expect(db.NIVELES_RAZKIDS).toHaveLength(29)
    expect(db.NIVELES_RAZKIDS[0]).toMatchObject({ letra: 'aa', orden: 1 })
    expect(db.NIVELES_RAZKIDS.at(-1)).toMatchObject({ letra: 'Z2', orden: 29 })
  })

  it('tiene las 17 filas de nivel_rubrica, con Pre Inicio solo en Alfabetización', () => {
    expect(db.NIVELES_RUBRICA).toHaveLength(17)
    expect(db.nivelesRubricaDe(1, 'Fluidez')).toHaveLength(5)
    expect(db.nivelesRubricaDe(1, 'Comprensión')).toHaveLength(4)
    expect(db.nivelesRubricaDe(2, 'Fluidez')).toHaveLength(4)
    expect(db.nivelesRubricaDe(2, 'Comprensión')).toHaveLength(4)
    const conPreInicio = db.NIVELES_RUBRICA.filter((n) => n.nombre_nivel === 'Pre Inicio')
    expect(conPreInicio).toHaveLength(1)
    expect(conPreInicio[0]).toMatchObject({ id_programa: 1, dimension: 'Fluidez' })
  })

  it('tiene 4 niveles generales y 9 colegios en dos zonas', () => {
    expect(db.NIVEL_GENERAL).toHaveLength(4)
    expect(db.COLEGIOS).toHaveLength(9)
    expect(new Set(db.COLEGIOS.map((c) => c.zona))).toEqual(new Set(['Yungay', 'Carhuaz']))
  })
})

describe('alumnos', () => {
  it('son 413 con código propio del sistema y sin datos personales de más', () => {
    expect(db.TOTAL_ALUMNOS).toBe(413)
    expect(db.ALUMNOS[0].codigo).toMatch(/^EST-[A-Z]{3}-\d{4}$/)
    // RN-019: nada de DNI, fecha de nacimiento, dirección ni fotos.
    const camposProhibidos = ['dni', 'fecha_nacimiento', 'direccion', 'foto', 'telefono']
    camposProhibidos.forEach((campo) => expect(db.ALUMNOS[0]).not.toHaveProperty(campo))
  })

  it('el grado no determina el programa: hay alfabetización en grados altos (RN-004)', () => {
    const altosEnAlfabetizacion = db.ALUMNOS.filter((a) => a.id_grado >= 5 && a.id_programa === 1)
    expect(altosEnAlfabetizacion.length).toBeGreaterThan(0)
  })

  it('hay alumnos evaluados con un ciclo por debajo del nominal (RN-004)', () => {
    expect(db.ALUMNOS.some((a) => a.id_ciclo_evaluado < a.id_ciclo_nominal)).toBe(true)
  })
})

describe('asignaciones de docentes (RN-003)', () => {
  it('cada docente lleva dos colegios por periodo, con los seis grados', () => {
    db.DOCENTES.forEach((docente) => {
      db.PERIODOS.forEach((periodo) => {
        const colegios = db.colegiosAsignadosA(docente.id_docente, periodo.id_periodo)
        expect(colegios).toHaveLength(2)
      })
      expect(db.asignacionesDe(docente.id_docente)[0].grados).toHaveLength(6)
    })
  })

  it('hay una rotación de colegio entre el primer y el tercer periodo', () => {
    const antes = db.colegiosAsignadosA(1, 1)
    const despues = db.colegiosAsignadosA(1, 3)
    expect(antes).not.toEqual(despues)
  })
})

describe('captura semanal', () => {
  it('genera siempre lo mismo para la misma semana (semilla fija)', () => {
    const primera = db.reporteSemanalDe(3)
    const segunda = db.reporteSemanalDe(3)
    expect(segunda).toBe(primera)
    expect(primera.size).toBeGreaterThan(300)
  })

  it('la semana en curso está a medio llenar, para que el docente la complete', () => {
    const actual = db.reporteSemanalDe(db.SEMANA_ACTUAL.id_semana)
    expect(actual.size).toBeLessThan(db.TOTAL_ALUMNOS * 0.6)
  })

  it('sin asistencia no se registran libros ni sala de lectura', () => {
    const filas = [...db.reporteSemanalDe(2).values()]
    filas
      .filter((f) => !f.asistio)
      .forEach((f) => {
        expect(f.libros).toHaveLength(0)
        expect(f.lsl).toBe(0)
      })
  })

  it('guardar una fila dos veces no la duplica (RNF-001)', () => {
    const idSemana = 5
    const antes = db.reporteSemanalDe(idSemana).size
    const fila = { id_alumno: db.ALUMNOS[0].id_alumno, id_semana: idSemana, asistio: true, lsl: 2, libros: [], observacion: '' }
    const primera = db.guardarReporteSemanal(fila)
    const segunda = db.guardarReporteSemanal({ ...fila, lsl: 3 })
    expect(segunda.id_reporte).toBe(primera.id_reporte)
    expect(db.reporteSemanalDe(idSemana).size).toBeLessThanOrEqual(antes + 1)
    expect(db.reporteSemanalDe(idSemana).get(fila.id_alumno).lsl).toBe(3)
  })
})

describe('evaluaciones diagnósticas', () => {
  it('cubre abril y julio y deja octubre y diciembre incompletos (§9)', () => {
    const porPeriodo = (id) => db.EVALUACIONES.filter((e) => e.id_periodo === id).length
    expect(porPeriodo(1)).toBe(db.TOTAL_ALUMNOS)
    expect(porPeriodo(3)).toBeLessThan(porPeriodo(2))
    expect(porPeriodo(4)).toBeLessThan(porPeriodo(3))
    expect(porPeriodo(4)).toBeGreaterThan(0)
  })

  it('el nivel inicial de un periodo es el nivel final del anterior (RN-005)', () => {
    const conVarias = db.evaluacionesDe(db.ALUMNOS[0].id_alumno)
    conVarias.slice(1).forEach((evaluacion, i) => {
      expect(evaluacion.nivel_inicial_razkids).toBe(conVarias[i].nivel_ajustado)
    })
  })

  it('todo cambio del nivel sugerido viene con justificación (RN-015)', () => {
    db.EVALUACIONES.filter((e) => e.ajustado_por_docente).forEach((e) => {
      expect(e.justificacion).toBeTruthy()
    })
  })
})
