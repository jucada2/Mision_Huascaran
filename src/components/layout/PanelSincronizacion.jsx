import { CloudOff, RefreshCw } from 'lucide-react'
import Button from '../ui/Button'
import Drawer from '../ui/Drawer'
import EmptyState from '../ui/EmptyState'
import useSyncStore from '../../store/syncStore'

/**
 * Detalle de la cola de envíos pendientes (RNF-001), que se abre desde el
 * SyncBadge de la barra superior (P2).
 *
 * TODO Fase 3: `useOfflineQueue` llenará esta lista desde IndexedDB y conectará
 * "Reintentar ahora". Hoy la cola siempre está vacía porque todavía no hay
 * pantallas de captura.
 */
export default function PanelSincronizacion({ abierto, onCerrar }) {
  const { items, sincronizando, ultimaSincronizacion } = useSyncStore()

  return (
    <Drawer
      open={abierto}
      onClose={onCerrar}
      title="Envíos pendientes"
      subtitle={
        ultimaSincronizacion
          ? `Última sincronización: ${new Date(ultimaSincronizacion).toLocaleString('es-PE')}`
          : 'Los registros se guardan en el equipo y se envían apenas hay conexión'
      }
      footer={
        <>
          <Button variant="outline" onClick={onCerrar}>
            Cerrar
          </Button>
          <Button iconLeft={RefreshCw} loading={sincronizando} disabled={items.length === 0}>
            Reintentar ahora
          </Button>
        </>
      }
    >
      {items.length === 0 ? (
        <EmptyState
          title="Todo sincronizado"
          description="No hay registros esperando ser enviados al servidor."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.clave} className="rounded-lg border border-line bg-surface-50 p-3">
              <p className="text-sm font-semibold text-ink-900">{item.descripcion}</p>
              <p className="mt-0.5 text-xs text-ink-500">
                {item.intentos} {item.intentos === 1 ? 'intento' : 'intentos'} · {item.clave}
              </p>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-5 flex items-start gap-2 rounded-lg bg-info-100 p-3 text-xs text-ink-700">
        <CloudOff className="mt-0.5 h-4 w-4 shrink-0 text-info-600" aria-hidden="true" />
        Si la conexión falla, el sistema reintenta hasta tres veces con esperas de 1, 4 y 9 segundos
        sin duplicar el registro (RNF-001).
      </p>
    </Drawer>
  )
}
