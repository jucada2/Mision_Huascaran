import { create } from 'zustand'

/**
 * Filtros que sobreviven a la navegación.
 *
 * Por ahora solo el periodo de evaluación vigente, que la barra superior deja
 * elegir y todas las pantallas leen (P2). Los filtros del dashboard (programa,
 * colegio, grado, aula, dimensión) se agregan en la Fase 6, cuando existan las
 * pantallas que los usan y se sincronicen con la URL.
 */
export const useFiltrosStore = create((set) => ({
  idPeriodo: null,

  setPeriodo: (idPeriodo) => set({ idPeriodo: idPeriodo == null ? null : Number(idPeriodo) }),

  /** Solo fija el periodo si el usuario todavía no eligió uno. */
  fijarPeriodoPorDefecto: (idPeriodo) =>
    set((estado) => (estado.idPeriodo == null ? { idPeriodo: Number(idPeriodo) } : estado)),
}))

export default useFiltrosStore
