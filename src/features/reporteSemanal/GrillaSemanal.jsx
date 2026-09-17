import { useCallback, useState } from 'react'
import { CheckCheck, Copy, Save } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import DrawerLibros from './DrawerLibros'
import EmptyState from '../../components/ui/EmptyState'
import FilaSemanal from './FilaSemanal'
import Skeleton from '../../components/ui/Skeleton'
import useCapturaSemanal from './useCapturaSemanal'
import { totalesDeFilas } from '../../domain/totales'
import { useToast } from '../../components/ui/Toast'

/**
 * Grilla de captura semanal (P4): todos los alumnos precargados en filas, no un
 * formulario por alumno. RNF-006 —bajar el registro de 2 horas a 1— se juega
 * aquí: nada de navegar por estudiante, acciones masivas y teclado.
 *
 * No usa `DataTable` a propósito: aquella es una tabla de lectura con orden y
 * paginación, y aquí paginar escondería alumnos sin registrar.
 */
const COLUMNAS_NAVEGABLES = ['asistencia', 'libros', 'lsl']

export default function GrillaSemanal({ idSemana, idColegio, idGrado, soloLectura = false }) {
  const toast = useToast()
  const [filaLibros, setFilaLibros] = useState(null)
  const {
    filas,
    estados,
    cargando,
    sinGuardar,
    actualizarFila,
    guardarTodo,
    marcarAsistenciaDeTodos,
    copiarSemanaAnterior,
  } = useCapturaSemanal({ idSemana, idColegio, idGrado })

  const totales = totalesDeFilas(filas)

  /** Enter baja a la misma columna de la fila siguiente (RNF-006). */
  const manejarTeclado = useCallback((evento) => {
    if (evento.key !== 'Enter') return
    const { fila, columna } = evento.target.dataset ?? {}
    if (!columna || !COLUMNAS_NAVEGABLES.includes(columna)) return
    evento.preventDefault()
    const siguiente = evento.currentTarget.querySelector(
      `[data-fila="${Number(fila) + 1}"][data-columna="${columna}"]`,
    )
    siguiente?.focus()
  }, [])

  const alCopiarSemana = async () => {
    const copiadas = await copiarSemanaAnterior()
    if (copiadas === 0) toast.info('La semana anterior no tiene registros para copiar')
    else toast.success(`Se copiaron ${copiadas} filas de la semana anterior`, 'Revíselas antes de guardar')
  }

  const alGuardarSemana = () => {
    const enviadas = guardarTodo()
    if (enviadas === 0) toast.info('No hay cambios pendientes de guardar')
    else toast.success(`${enviadas} ${enviadas === 1 ? 'fila enviada' : 'filas enviadas'}`, 'El envío continúa aunque cierre la pantalla')
  }

  if (cargando) return <Card padded={false}><Skeleton variant="table" rows={8} className="p-5" /></Card>

  if (filas.length === 0) {
    return (
      <Card padded={false}>
        <EmptyState
          title="Sin estudiantes para estos filtros"
          description="Elija otro colegio o grado de sus asignaciones."
        />
      </Card>
    )
  }

  return (
    <>
      <Card
        padded={false}
        title={`${totales.registrados} de ${totales.alumnos} estudiantes registrados`}
        subtitle={`${totales.asistieron} asistencias · ${totales.lsb} LSB · ${totales.lsl} LSL`}
        actions={
          !soloLectura && (
            <>
              <Button variant="outline" size="sm" iconLeft={CheckCheck} onClick={() => marcarAsistenciaDeTodos(true)}>
                Marcar toda la asistencia
              </Button>
              <Button variant="outline" size="sm" iconLeft={Copy} onClick={alCopiarSemana}>
                Copiar semana anterior
              </Button>
              <Button size="sm" iconLeft={Save} onClick={alGuardarSemana}>
                Guardar semana{sinGuardar > 0 ? ` (${sinGuardar})` : ''}
              </Button>
            </>
          )
        }
      >
        {/* RNF-002: el desplazamiento horizontal vive dentro de la tarjeta. */}
        <div className="sicedu-scrollbar overflow-x-auto" onKeyDown={manejarTeclado}>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-surface-100 text-xs font-semibold uppercase tracking-wide text-ink-500">
                <th scope="col" className="sticky left-0 z-10 border-b border-line bg-surface-100 px-4 py-3 text-left">
                  Estudiante
                </th>
                <th scope="col" className="border-b border-line px-3 py-3 text-center">
                  Nivel esperado
                </th>
                <th scope="col" className="border-b border-line px-3 py-3 text-center">
                  Nivel colocado
                </th>
                <th scope="col" className="border-b border-line px-3 py-3 text-center">
                  Asistencia
                </th>
                <th scope="col" className="border-b border-line px-3 py-3 text-center">
                  Libros de subir de nivel
                </th>
                <th scope="col" className="border-b border-line px-3 py-3 text-center">
                  Sala de lectura
                </th>
                <th scope="col" className="border-b border-line px-3 py-3 text-center">
                  Total
                </th>
                <th scope="col" className="border-b border-line px-3 py-3 text-left">
                  Observación
                </th>
                <th scope="col" className="border-b border-line px-3 py-3 text-center">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {filas.map((fila, indice) => (
                <FilaSemanal
                  key={fila.id_alumno}
                  fila={fila}
                  indice={indice}
                  estado={estados[fila.id_alumno]}
                  soloLectura={soloLectura}
                  onCambiar={actualizarFila}
                  onAbrirLibros={setFilaLibros}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-line px-4 py-3 text-xs text-ink-500">
          <p>Cero libros es un valor válido en semanas sin actividad lectiva.</p>
          <p className="mt-1">
            Las columnas con candado vienen del último registro de vuelo y del catálogo de nivel esperado:
            son referencia, no se editan aquí.
          </p>
        </div>
      </Card>

      <DrawerLibros
        abierto={Boolean(filaLibros)}
        fila={filaLibros}
        soloLectura={soloLectura}
        onCerrar={() => setFilaLibros(null)}
        onGuardar={(libros) => actualizarFila(filaLibros.id_alumno, { libros })}
      />
    </>
  )
}
