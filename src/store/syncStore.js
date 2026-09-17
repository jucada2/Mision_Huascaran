import { create } from 'zustand'

/**
 * Estado observable de la cola de envíos pendientes (RNF-001).
 * La cola en sí vive en IndexedDB (`src/hooks/useOfflineQueue.js`); este almacén
 * solo publica su estado para que el SyncBadge y los avisos lo reflejen.
 */
export const useSyncStore = create((set) => ({
  pendientes: 0,
  sincronizando: false,
  ultimoError: null,
  ultimaSincronizacion: null,
  items: [],

  setEstado: (parcial) => set(parcial),
  setPendientes: (items) => set({ pendientes: items.length, items }),
  iniciarSincronizacion: () => set({ sincronizando: true, ultimoError: null }),
  terminarSincronizacion: (error = null) =>
    set({
      sincronizando: false,
      ultimoError: error,
      ultimaSincronizacion: error ? null : new Date().toISOString(),
    }),
}))

export default useSyncStore
