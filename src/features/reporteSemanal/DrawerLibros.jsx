import { useEffect, useState } from 'react'
import { BookPlus, Trash2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import Drawer from '../../components/ui/Drawer'
import EmptyState from '../../components/ui/EmptyState'
import { controlClases } from '../../components/ui/Field'
import cn from '../../lib/cn'

/**
 * Libros de subir de nivel (LSB) de una fila del reporte semanal.
 *
 * RF-015: cada libro lleva título, aciertos y total en campos SEPARADOS —en el
 * Excel actual venían en una sola celda como "El zorro 4/5" y eso es justo lo
 * que el sistema viene a corregir. Los libros de sala de lectura (LSL) no pasan
 * por aquí: son solo una cantidad.
 */
const libroVacio = () => ({ titulo: '', aciertos: '', total: '' })

function errorDeLibro(libro) {
  if (!libro.titulo.trim()) return 'Falta el título'
  if (libro.total === '' || Number(libro.total) <= 0) return 'Indique de cuántas preguntas'
  if (libro.aciertos === '' || Number(libro.aciertos) < 0) return 'Indique los aciertos'
  if (Number(libro.aciertos) > Number(libro.total)) return 'Los aciertos no pueden superar el total'
  return null
}

export default function DrawerLibros({ abierto, onCerrar, fila, onGuardar, soloLectura = false }) {
  const [libros, setLibros] = useState([])
  const [tocado, setTocado] = useState(false)

  useEffect(() => {
    if (abierto) {
      setLibros((fila?.libros ?? []).map((l) => ({ ...l })))
      setTocado(false)
    }
  }, [abierto, fila])

  const errores = libros.map(errorDeLibro)
  const hayErrores = errores.some(Boolean)

  const cambiar = (indice, campo, valor) => {
    setLibros((previos) => previos.map((l, i) => (i === indice ? { ...l, [campo]: valor } : l)))
  }

  const guardar = () => {
    setTocado(true)
    if (hayErrores) return
    onGuardar(
      libros.map(({ id_libro: idLibro, titulo, aciertos, total }) => ({
        id_libro: idLibro,
        titulo: titulo.trim(),
        aciertos: Number(aciertos),
        total: Number(total),
      })),
    )
    onCerrar()
  }

  return (
    <Drawer
      open={abierto}
      onClose={onCerrar}
      title="Libros de subir de nivel"
      subtitle={fila?.nombre}
      footer={
        <>
          <Button variant="outline" onClick={onCerrar}>
            Cancelar
          </Button>
          {!soloLectura && (
            <Button onClick={guardar} disabled={tocado && hayErrores}>
              Guardar libros
            </Button>
          )}
        </>
      }
    >
      {libros.length === 0 ? (
        <EmptyState
          icon={BookPlus}
          title="Sin libros esta semana"
          description="Cero libros es un valor válido en semanas sin actividad lectiva (RN-006)."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {libros.map((libro, i) => (
            <li key={libro.id_libro ?? `nuevo-${i}`} className="rounded-lg border border-line bg-surface-50 p-3">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                    Título del libro
                    <input
                      type="text"
                      value={libro.titulo}
                      disabled={soloLectura}
                      onChange={(e) => cambiar(i, 'titulo', e.target.value)}
                      className={cn(controlClases(tocado && !libro.titulo.trim(), 'mt-1 h-9'))}
                    />
                  </label>

                  <div className="mt-2 flex items-end gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                      Aciertos
                      <input
                        type="number"
                        min="0"
                        value={libro.aciertos}
                        disabled={soloLectura}
                        onChange={(e) => cambiar(i, 'aciertos', e.target.value)}
                        className={cn(controlClases(false, 'mt-1 h-9 w-20 text-center'))}
                      />
                    </label>
                    <span className="pb-2 text-sm text-ink-400">de</span>
                    <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                      Total
                      <input
                        type="number"
                        min="1"
                        value={libro.total}
                        disabled={soloLectura}
                        onChange={(e) => cambiar(i, 'total', e.target.value)}
                        className={cn(controlClases(false, 'mt-1 h-9 w-20 text-center'))}
                      />
                    </label>
                  </div>
                </div>

                {!soloLectura && (
                  <button
                    type="button"
                    onClick={() => setLibros((previos) => previos.filter((_, j) => j !== i))}
                    aria-label={`Quitar ${libro.titulo || 'libro'}`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-danger-100 hover:text-danger-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {tocado && errores[i] && <p className="mt-2 text-xs font-medium text-danger-600">{errores[i]}</p>}
            </li>
          ))}
        </ul>
      )}

      {!soloLectura && (
        <Button
          variant="secondary"
          iconLeft={BookPlus}
          className="mt-4 w-full"
          onClick={() => setLibros((previos) => [...previos, libroVacio()])}
        >
          Agregar libro
        </Button>
      )}
    </Drawer>
  )
}
