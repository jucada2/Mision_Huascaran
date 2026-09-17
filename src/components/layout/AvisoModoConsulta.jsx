import { Eye } from 'lucide-react'

/**
 * Aviso fijo de modo lectura (§5, RF-003).
 *
 * Un Profesor puede CONSULTAR cualquier colegio, pero solo edita los que tiene
 * asignados en el periodo vigente. Cuando abre uno ajeno, la pantalla se lo dice
 * y todos sus controles quedan deshabilitados.
 */
export default function AvisoModoConsulta({ mensaje }) {
  return (
    <div
      role="status"
      className="flex items-start gap-2 rounded-xl border border-info-600/20 bg-info-100 px-4 py-3 text-sm font-medium text-info-600"
    >
      <Eye className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      {mensaje ?? 'Modo consulta — este colegio no está asignado a usted en el periodo vigente'}
    </div>
  )
}
