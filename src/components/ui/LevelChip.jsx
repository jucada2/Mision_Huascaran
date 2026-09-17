import cn from '../../lib/cn'
import { clasesDeNivel, clasesDeLetraRazKids } from '../../domain/niveles'

/**
 * Distintivo de nivel. Acepta:
 *  - `nivel`: "Pre Inicio" … "Destacado" (rúbrica y nivel general).
 *  - `letra` + `orden` + `totalNiveles`: nivel Raz-Kids (RN-012, color por `orden`).
 */
export default function LevelChip({ nivel, letra, orden, totalNiveles = 29, size = 'md', className }) {
  const etiqueta = nivel ?? letra
  if (!etiqueta) {
    return <span className="text-xs text-ink-400">—</span>
  }

  const clases = nivel ? clasesDeNivel(nivel) : clasesDeLetraRazKids(orden, totalNiveles)

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full border font-semibold',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs',
        letra && 'min-w-[2.25rem] tabular-nums',
        clases,
        className,
      )}
    >
      {etiqueta}
    </span>
  )
}
