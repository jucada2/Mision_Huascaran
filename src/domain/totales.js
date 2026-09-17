// RF-016: los totales de libros los calcula el sistema y el docente no los
// escribe. Fuente única: si algún día cambia qué cuenta como "total", se cambia
// aquí y no en seis tablas distintas.
//
// Dos tipos de libro, que NO se mezclan (RF-015):
//  - LSB (libros de subir de nivel): llevan título, aciertos y total.
//  - LSL (sala de lectura): solo una cantidad.

/** Cantidad de libros de subir de nivel de una fila. */
export const contarLsb = (libros) => (Array.isArray(libros) ? libros.length : 0)

/** Total de libros de la semana: LSB + LSL. Cero es un valor válido (RN-006). */
export function totalLibros(fila = {}) {
  if (fila.asistio === false) return 0
  return contarLsb(fila.libros) + Number(fila.lsl ?? 0)
}

/** Aciertos y preguntas acumulados de los LSB, para la ficha del estudiante. */
export function puntajeLsb(libros = []) {
  return libros.reduce(
    (acumulado, libro) => ({
      aciertos: acumulado.aciertos + Number(libro?.aciertos ?? 0),
      total: acumulado.total + Number(libro?.total ?? 0),
    }),
    { aciertos: 0, total: 0 },
  )
}

/** Totales de la grilla completa, para el pie de la tabla del reporte semanal. */
export function totalesDeFilas(filas = []) {
  return filas.reduce(
    (acumulado, fila) => ({
      alumnos: acumulado.alumnos + 1,
      asistieron: acumulado.asistieron + (fila.asistio ? 1 : 0),
      lsb: acumulado.lsb + (fila.asistio ? contarLsb(fila.libros) : 0),
      lsl: acumulado.lsl + (fila.asistio ? Number(fila.lsl ?? 0) : 0),
      total: acumulado.total + totalLibros(fila),
      registrados: acumulado.registrados + (fila.asistio == null ? 0 : 1),
    }),
    { alumnos: 0, asistieron: 0, lsb: 0, lsl: 0, total: 0, registrados: 0 },
  )
}
