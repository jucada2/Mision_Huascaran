import { useEffect, useState } from 'react'
import { ChevronDown, LogOut, Menu } from 'lucide-react'
import Breadcrumbs from './Breadcrumbs'
import PanelSincronizacion from './PanelSincronizacion'
import Select from '../ui/Select'
import SyncBadge from '../ui/SyncBadge'
import useOnEscape from '../../hooks/useOnEscape'
import useFiltrosStore from '../../store/filtrosStore'
import useSyncStore from '../../store/syncStore'
import { usePeriodos } from '../../hooks/useCatalogos'
import { useAuth } from '../../auth/AuthProvider'
import { NOMBRE_ROL } from '../../auth/roles'

/** Selector del periodo de evaluación vigente (P2). Lo leen todas las pantallas. */
function SelectorPeriodo() {
  const { data: periodos = [] } = usePeriodos()
  const idPeriodo = useFiltrosStore((s) => s.idPeriodo)
  const setPeriodo = useFiltrosStore((s) => s.setPeriodo)
  const fijarPeriodoPorDefecto = useFiltrosStore((s) => s.fijarPeriodoPorDefecto)

  // Por defecto, el periodo abierto (RN-010).
  useEffect(() => {
    const vigente = periodos.find((p) => p.estado === 'abierto') ?? periodos.at(-1)
    if (vigente) fijarPeriodoPorDefecto(vigente.id_periodo)
  }, [periodos, fijarPeriodoPorDefecto])

  if (periodos.length === 0) return null

  return (
    <Select
      aria-label="Periodo de evaluación vigente"
      value={idPeriodo ?? ''}
      onChange={(e) => setPeriodo(e.target.value)}
      className="w-32 sm:w-44"
      options={periodos.map((p) => ({
        value: p.id_periodo,
        label: `${p.nombre} ${p.anio}${p.estado === 'abierto' ? ' · vigente' : ''}`,
      }))}
    />
  )
}

function MenuUsuario() {
  const { usuario, salir } = useAuth()
  const [abierto, setAbierto] = useState(false)
  useOnEscape(abierto, () => setAbierto(false))

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={abierto}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
      >
        <span className="hidden min-w-0 md:block">
          <span className="block max-w-[180px] truncate text-sm font-semibold text-ink-900">{usuario?.nombres}</span>
          <span className="block text-xs text-ink-500">{NOMBRE_ROL[usuario?.id_rol] ?? '—'}</span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
      </button>

      {abierto && (
        <>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Cerrar menú de usuario"
            onClick={() => setAbierto(false)}
            className="fixed inset-0 z-40 h-full w-full cursor-default"
          />
          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-line bg-surface-0 p-1.5 shadow-card animate-slide-up"
          >
            <div className="px-3 py-2 md:hidden">
              <p className="truncate text-sm font-semibold text-ink-900">{usuario?.nombres}</p>
              <p className="truncate text-xs text-ink-500">{NOMBRE_ROL[usuario?.id_rol] ?? '—'}</p>
            </div>
            <p className="truncate px-3 py-1 text-xs text-ink-400">{usuario?.correo}</p>
            <button
              type="button"
              role="menuitem"
              onClick={salir}
              className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-surface-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Cerrar sesión
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function Topbar({ onAbrirMenu }) {
  const [panelAbierto, setPanelAbierto] = useState(false)
  const { pendientes, sincronizando, ultimoError } = useSyncStore()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-line bg-surface-0 px-4 sm:gap-3 sm:px-6">
      <button
        type="button"
        onClick={onAbrirMenu}
        aria-label="Abrir menú"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-700 transition-colors hover:bg-surface-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Breadcrumbs className="flex-1" />

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <SelectorPeriodo />
        <SyncBadge
          pendientes={pendientes}
          sincronizando={sincronizando}
          error={Boolean(ultimoError)}
          onClick={() => setPanelAbierto(true)}
        />
        <MenuUsuario />
      </div>

      <PanelSincronizacion abierto={panelAbierto} onCerrar={() => setPanelAbierto(false)} />
    </header>
  )
}
