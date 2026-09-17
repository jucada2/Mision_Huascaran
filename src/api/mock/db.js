// Generador determinista de datos de prueba (§9).
//
// Semilla fija: las tablas y los gráficos son idénticos en cada recarga, para que
// las capturas del equipo siempre muestren lo mismo.
//
// Ley N.° 29733 (RN-019): todos los nombres, correos y códigos de aquí son
// FICTICIOS. No hay ni un dato real de un menor en este archivo.
//
// Los catálogos tienen exactamente la forma que devolverá el backend
// (`nivel_razkids`, `nivel_rubrica`, `nivel_general`, `nivel_esperado_por_grado`).
import dayjs from 'dayjs'

export const SEMILLA = 20260417
export const ANIO_LECTIVO = 2026

/** PRNG mulberry32: misma semilla → misma secuencia, en cualquier navegador. */
export function crearRandom(semilla) {
  let a = semilla >>> 0
  return function random() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const elegir = (random, lista) => lista[Math.floor(random() * lista.length)]

// ── Catálogos base ──────────────────────────────────────────────────────────

export const PROGRAMAS = [
  { id_programa: 1, nombre: 'Alfabetización' },
  { id_programa: 2, nombre: 'Comprensión Lectora' },
]

/** Ciclos de la EBR. El grado NO determina el ciclo evaluado (RN-004). */
export const CICLOS = [
  { id_ciclo: 1, nombre: 'III', grados: [1, 2] },
  { id_ciclo: 2, nombre: 'IV', grados: [3, 4] },
  { id_ciclo: 3, nombre: 'V', grados: [5, 6] },
]

export const GRADOS = [1, 2, 3, 4, 5, 6].map((n) => ({
  id_grado: n,
  numero: n,
  nombre: `${n}.°`,
  id_ciclo: CICLOS.find((c) => c.grados.includes(n)).id_ciclo,
}))

/** Escala Raz-Kids: aa, A…Z, Z1, Z2 (29 niveles). Se compara por `orden` (RN-012). */
export const NIVELES_RAZKIDS = ['aa', ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)), 'Z1', 'Z2'].map(
  (letra, i) => ({ id_nivel_razkids: i + 1, letra, orden: i + 1 }),
)

export const TOTAL_NIVELES_RAZKIDS = NIVELES_RAZKIDS.length

export const letraPorOrden = (orden) =>
  NIVELES_RAZKIDS.find((n) => n.orden === Math.max(1, Math.min(TOTAL_NIVELES_RAZKIDS, orden)))?.letra ?? 'aa'

export const ordenDeLetra = (letra) => NIVELES_RAZKIDS.find((n) => n.letra === letra)?.orden ?? null

// TODO: los descriptores oficiales salen del instrumento de rúbrica de Misión
// Huascarán (RF-025). Los de abajo son provisionales, solo para poder ver el
// Tooltip de P5 mientras el documento llega.
const DESCRIPTORES = {
  Fluidez: {
    'Pre Inicio': 'Aún no reconoce todas las letras; necesita acompañamiento permanente para decodificar.',
    Inicio: 'Lee palabras sueltas de forma silábica, con pausas frecuentes.',
    Proceso: 'Lee oraciones cortas con vacilaciones y autocorrecciones.',
    Logrado: 'Lee textos del ciclo {ciclo} de corrido y con la entonación esperada.',
    Destacado: 'Lee con fluidez y expresividad textos por encima del ciclo {ciclo}.',
  },
  Comprensión: {
    Inicio: 'Recupera datos sueltos del texto solo con ayuda del docente.',
    Proceso: 'Identifica el tema y algunos detalles explícitos del texto del ciclo {ciclo}.',
    Logrado: 'Infiere el propósito del texto y relaciona sus partes sin ayuda.',
    Destacado: 'Interpreta el texto, lo compara con otros y sustenta su opinión.',
  },
}

/**
 * `nivel_rubrica`: 17 filas.
 * Alfabetización → Fluidez 5 niveles (incluye Pre Inicio) y Comprensión 4.
 * Comprensión Lectora → 4 y 4. Nunca se hardcodea en la interfaz (RN-011).
 */
export const NIVELES_RUBRICA = (() => {
  const combinaciones = [
    { id_programa: 1, dimension: 'Fluidez', niveles: ['Pre Inicio', 'Inicio', 'Proceso', 'Logrado', 'Destacado'] },
    { id_programa: 1, dimension: 'Comprensión', niveles: ['Inicio', 'Proceso', 'Logrado', 'Destacado'] },
    { id_programa: 2, dimension: 'Fluidez', niveles: ['Inicio', 'Proceso', 'Logrado', 'Destacado'] },
    { id_programa: 2, dimension: 'Comprensión', niveles: ['Inicio', 'Proceso', 'Logrado', 'Destacado'] },
  ]
  let id = 0
  return combinaciones.flatMap(({ id_programa, dimension, niveles }) =>
    niveles.map((nombre_nivel, i) => ({
      id_nivel_rubrica: ++id,
      id_programa,
      dimension,
      orden: i + 1,
      nombre_nivel,
      descriptores: Object.fromEntries(
        CICLOS.map((c) => [c.nombre, (DESCRIPTORES[dimension][nombre_nivel] ?? '').replace('{ciclo}', c.nombre)]),
      ),
    })),
  )
})()

/** `nivel_general`: 4 filas. "Pre Inicio" hoy solo existe en Fluidez (§13). */
export const NIVEL_GENERAL = ['Inicio', 'Proceso', 'Logrado', 'Destacado'].map((nombre_nivel, i) => ({
  id_nivel_general: i + 1,
  orden: i + 1,
  nombre_nivel,
}))

// TODO RN-013: el nivel Raz-Kids esperado por grado está pendiente de
// confirmación con Misión Huascarán. Esta tabla es provisional.
export const NIVEL_ESPERADO_POR_GRADO = [
  { id_grado: 1, letra: 'C' },
  { id_grado: 2, letra: 'G' },
  { id_grado: 3, letra: 'J' },
  { id_grado: 4, letra: 'M' },
  { id_grado: 5, letra: 'P' },
  { id_grado: 6, letra: 'S' },
].map((fila) => ({ ...fila, orden: ordenDeLetra(fila.letra) }))

/** Los nueve colegios del programa. Códigos y nombres de plantel ficticios. */
export const COLEGIOS = [
  { id_colegio: 1, nombre: 'I.E. 86021 Ranrahirca', abreviatura: 'RAN', zona: 'Yungay', distrito: 'Ranrahirca' },
  { id_colegio: 2, nombre: 'I.E. 86024 Mancos', abreviatura: 'MAN', zona: 'Yungay', distrito: 'Mancos' },
  { id_colegio: 3, nombre: 'I.E. 86031 Shupluy', abreviatura: 'SHU', zona: 'Yungay', distrito: 'Shupluy' },
  { id_colegio: 4, nombre: 'I.E. 86037 Cascapara', abreviatura: 'CAS', zona: 'Yungay', distrito: 'Cascapara' },
  { id_colegio: 5, nombre: 'I.E. 86042 Yanama', abreviatura: 'YAN', zona: 'Yungay', distrito: 'Yanama' },
  { id_colegio: 6, nombre: 'I.E. 86412 Marcará', abreviatura: 'MAR', zona: 'Carhuaz', distrito: 'Marcará' },
  { id_colegio: 7, nombre: 'I.E. 86418 Acopampa', abreviatura: 'ACO', zona: 'Carhuaz', distrito: 'Acopampa' },
  { id_colegio: 8, nombre: 'I.E. 86423 Shilla', abreviatura: 'SHI', zona: 'Carhuaz', distrito: 'Shilla' },
  { id_colegio: 9, nombre: 'I.E. 86427 Tinco', abreviatura: 'TIN', zona: 'Carhuaz', distrito: 'Tinco' },
]

/** Los cuatro cortes del año (RN-010). Solo uno está abierto a la vez. */
export const PERIODOS = [
  { id_periodo: 1, nombre: 'Abril', mes: 4, anio: ANIO_LECTIVO, estado: 'cerrado' },
  { id_periodo: 2, nombre: 'Julio', mes: 7, anio: ANIO_LECTIVO, estado: 'cerrado' },
  { id_periodo: 3, nombre: 'Octubre', mes: 10, anio: ANIO_LECTIVO, estado: 'abierto' },
  { id_periodo: 4, nombre: 'Diciembre', mes: 12, anio: ANIO_LECTIVO, estado: 'programado' },
]

export const PERIODO_VIGENTE = PERIODOS.find((p) => p.estado === 'abierto')

/** 18 semanas lectivas, de lunes a viernes, desde el inicio del año escolar. */
const INICIO_ANIO_ESCOLAR = `${ANIO_LECTIVO}-03-16`

export const SEMANAS = Array.from({ length: 18 }, (_, i) => {
  const inicio = dayjs(INICIO_ANIO_ESCOLAR).add(i, 'week')
  return {
    id_semana: i + 1,
    numero: i + 1,
    inicio: inicio.format('YYYY-MM-DD'),
    fin: inicio.add(4, 'day').format('YYYY-MM-DD'),
    mes: inicio.month() + 1,
    anio: inicio.year(),
  }
})

// ── Usuarios, docentes y asignaciones ───────────────────────────────────────

/** Contraseña única del entorno de prueba. Nunca sale de modo mock. */
export const CLAVE_DEMO = 'sicedu123'

export const DOCENTES = [
  { id_docente: 1, nombres: 'Rosa Elena', apellidos: 'Cárdenas Villanueva' },
  { id_docente: 2, nombres: 'Julio César', apellidos: 'Meléndez Paredes' },
  { id_docente: 3, nombres: 'Marlene', apellidos: 'Huamán Salazar' },
]

export const USUARIOS = [
  { id_usuario: 1, id_rol: 1, correo: 'rcardenas@sicedu.test', id_docente: 1, nombres: 'Rosa Elena Cárdenas Villanueva' },
  { id_usuario: 2, id_rol: 1, correo: 'jmelendez@sicedu.test', id_docente: 2, nombres: 'Julio César Meléndez Paredes' },
  { id_usuario: 3, id_rol: 1, correo: 'mhuaman@sicedu.test', id_docente: 3, nombres: 'Marlene Huamán Salazar' },
  { id_usuario: 4, id_rol: 2, correo: 'jefatura@sicedu.test', id_docente: null, nombres: 'Ana Lucía Bustamante Rojas' },
  { id_usuario: 5, id_rol: 3, correo: 'direccion@sicedu.test', id_docente: null, nombres: 'Gerardo Ríos Del Águila' },
]

/**
 * RN-003: cada docente lleva DOS colegios y en cada uno los SEIS grados.
 * La rotación ocurre solo al cierre de un periodo y cambia el colegio completo:
 * la docente 1 deja Mancos y toma Shupluy a partir de octubre.
 * Los colegios 8 y 9 no tienen docente con usuario en este mock: sirven para ver
 * la cobertura incompleta en los consolidados.
 */
export const ASIGNACIONES = [
  { id_asignacion: 1, id_docente: 1, id_colegio: 1, id_periodo: 1 },
  { id_asignacion: 2, id_docente: 1, id_colegio: 2, id_periodo: 1 },
  { id_asignacion: 3, id_docente: 1, id_colegio: 1, id_periodo: 2 },
  { id_asignacion: 4, id_docente: 1, id_colegio: 2, id_periodo: 2 },
  { id_asignacion: 5, id_docente: 1, id_colegio: 1, id_periodo: 3 },
  { id_asignacion: 6, id_docente: 1, id_colegio: 3, id_periodo: 3 },
  { id_asignacion: 7, id_docente: 1, id_colegio: 1, id_periodo: 4 },
  { id_asignacion: 8, id_docente: 1, id_colegio: 3, id_periodo: 4 },
  ...[2, 3].flatMap((id_docente, i) =>
    PERIODOS.flatMap((p) =>
      [4 + i * 2, 5 + i * 2].map((id_colegio, j) => ({
        id_asignacion: 100 + id_docente * 10 + p.id_periodo * 2 + j,
        id_docente,
        id_colegio,
        id_periodo: p.id_periodo,
      })),
    ),
  ),
].map((a) => ({ ...a, grados: GRADOS.map((g) => g.id_grado) }))

// ── Alumnos ─────────────────────────────────────────────────────────────────

const NOMBRES = [
  'Ana Lucía', 'Milagros', 'Yenifer', 'Rosmery', 'Katherine', 'Briseida', 'Nayeli', 'Maricielo',
  'Fiorella', 'Estrella', 'Jhoselyn', 'Dayana', 'Karen', 'Luz Marina', 'Yulisa', 'Anthony',
  'Jhon Kevin', 'Elmer', 'Wilmer', 'Yonatan', 'Franklin', 'Cristhian', 'Deysi', 'Rodrigo',
  'Jhordan', 'Alexander', 'Maribel', 'Leidy', 'Jhonatan', 'Kiara', 'Angie', 'Josué',
  'Piero', 'Diego Armando', 'Yoselin', 'Ruth Noemí', 'Erick', 'Jampier', 'Brayan', 'Nicol',
]

const APELLIDOS = [
  'Alvarado', 'Ascencio', 'Barreto', 'Cáceres', 'Camones', 'Cerna', 'Chauca', 'Colonia',
  'Cordero', 'Depaz', 'Espinoza', 'Figueroa', 'Garay', 'Guillén', 'Henostroza', 'Huamán',
  'Jamanca', 'Lliuya', 'Loli', 'Macedo', 'Maguiña', 'Mejía', 'Melgarejo', 'Minaya',
  'Morales', 'Norabuena', 'Obregón', 'Palacios', 'Paucar', 'Príncipe', 'Quispe', 'Ramírez',
  'Rosales', 'Salazar', 'Sánchez', 'Shuan', 'Tarazona', 'Toledo', 'Valverde', 'Villanueva',
]

/** 413 alumnos, repartidos de forma desigual como en la realidad. */
const ALUMNOS_POR_COLEGIO = [62, 54, 48, 45, 44, 42, 41, 40, 37]

/**
 * Probabilidad de seguir en Alfabetización por grado: alta en los primeros
 * grados, pero nunca cero en los últimos — el grado NO determina el programa
 * (§1, RN-004).
 */
const PROB_ALFABETIZACION = { 1: 0.85, 2: 0.7, 3: 0.35, 4: 0.2, 5: 0.12, 6: 0.08 }

export const ALUMNOS = (() => {
  const random = crearRandom(SEMILLA)
  const alumnos = []
  let idAlumno = 0

  COLEGIOS.forEach((colegio, indiceColegio) => {
    const total = ALUMNOS_POR_COLEGIO[indiceColegio]
    // Reparto del colegio entre sus seis grados, con el resto en los primeros.
    const base = Math.floor(total / 6)
    const porGrado = GRADOS.map((g, i) => base + (i < total % 6 ? 1 : 0))
    let correlativo = 1000

    GRADOS.forEach((grado, i) => {
      const cantidad = porGrado[i]
      const dosAulas = cantidad > 9
      for (let n = 0; n < cantidad; n += 1) {
        const esAlfabetizacion = random() < PROB_ALFABETIZACION[grado.numero]
        // RN-004: el ciclo evaluado puede ir por debajo del ciclo nominal.
        const cicloNominal = grado.id_ciclo
        const idCicloEvaluado = random() < 0.18 ? Math.max(1, cicloNominal - 1) : cicloNominal
        correlativo += 1
        idAlumno += 1
        alumnos.push({
          id_alumno: idAlumno,
          codigo: `EST-${colegio.abreviatura}-${correlativo}`,
          nombres: elegir(random, NOMBRES),
          apellidos: `${elegir(random, APELLIDOS)} ${elegir(random, APELLIDOS)}`,
          id_colegio: colegio.id_colegio,
          id_grado: grado.id_grado,
          aula: dosAulas ? (n % 2 === 0 ? 'A' : 'B') : 'A',
          id_ciclo_nominal: cicloNominal,
          id_ciclo_evaluado: idCicloEvaluado,
          id_programa: esAlfabetizacion ? 1 : 2,
          activo: random() > 0.02,
        })
      }
    })
  })

  return alumnos
})()

export const TOTAL_ALUMNOS = ALUMNOS.length

/** Nombre completo tal como se muestra en tablas y fichas. */
export const nombreCompleto = (alumno) => `${alumno.apellidos}, ${alumno.nombres}`

// TODO Fase 3: reporte semanal y rúbrica semanal (18 semanas por alumno).
// TODO Fase 4: evaluaciones diagnósticas de los cuatro periodos, con cortes
//              incompletos en octubre y diciembre.
// TODO Fase 5: niveles finales mensuales, algunos ajustados con justificación.
