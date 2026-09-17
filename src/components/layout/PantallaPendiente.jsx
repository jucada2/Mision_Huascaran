import { Construction } from 'lucide-react'
import Card from '../ui/Card'
import EmptyState from '../ui/EmptyState'

/**
 * Marcador de una pantalla que todavía no toca construir.
 *
 * Las rutas existen desde la Fase 2 para que las guardas de rol se puedan probar
 * de verdad (RNF-004) y el menú lateral funcione completo; cada una se reemplaza
 * por su pantalla real en la fase que le corresponde (§11).
 */
export default function PantallaPendiente({ titulo, fase, descripcion }) {
  return (
    <Card padded={false}>
      <EmptyState
        icon={Construction}
        title={titulo}
        description={descripcion ?? `Esta pantalla se construye en la ${fase}.`}
      />
    </Card>
  )
}
