// RF-016: el total de libros lo calcula el sistema, no el docente.
import { describe, expect, it } from 'vitest'
import { contarLsb, puntajeLsb, totalLibros, totalesDeFilas } from '../totales'

const libros = [
  { titulo: 'El zorro y el cuy', aciertos: 4, total: 5 },
  { titulo: 'El río que canta', aciertos: 8, total: 10 },
]

describe('totalLibros', () => {
  it('suma los libros de subir de nivel y los de sala de lectura', () => {
    expect(totalLibros({ asistio: true, libros, lsl: 3 })).toBe(5)
  })

  it('cero libros es un valor válido (RN-006)', () => {
    expect(totalLibros({ asistio: true, libros: [], lsl: 0 })).toBe(0)
  })

  it('sin asistencia el total es cero aunque queden datos en la fila', () => {
    expect(totalLibros({ asistio: false, libros, lsl: 3 })).toBe(0)
  })

  it('tolera una fila todavía sin capturar', () => {
    expect(totalLibros({})).toBe(0)
    expect(contarLsb(undefined)).toBe(0)
  })
})

describe('puntajeLsb', () => {
  it('acumula aciertos y preguntas de los libros con puntaje', () => {
    expect(puntajeLsb(libros)).toEqual({ aciertos: 12, total: 15 })
  })
})

describe('totalesDeFilas', () => {
  it('resume la grilla completa para el pie de la tabla', () => {
    const resumen = totalesDeFilas([
      { asistio: true, libros, lsl: 1 },
      { asistio: false, libros: [], lsl: 0 },
      { asistio: null, libros: [], lsl: 0 },
    ])
    expect(resumen).toEqual({ alumnos: 3, asistieron: 1, lsb: 2, lsl: 1, total: 3, registrados: 2 })
  })
})
