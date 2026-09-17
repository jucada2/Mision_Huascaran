import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ToastProvider } from './components/ui'
import UiKitPage from './features/uiKit/UiKitPage'

/**
 * Router y proveedores de la aplicación.
 *
 * RNF-001: la política de reintentos de TanStack Query es la espera creciente de
 * 1s / 4s / 9s exigida por el requerimiento. Las mutaciones de captura no se
 * reintentan aquí: pasan por la cola en IndexedDB, que controla su propia
 * idempotencia (ver `hooks/useOfflineQueue.js`).
 */
const ESPERAS_MS = [1000, 4000, 9000]

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (intento) => ESPERAS_MS[Math.min(intento, ESPERAS_MS.length - 1)],
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 0 },
  },
})

const enDesarrollo = import.meta.env.DEV

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Catálogo visual del sistema de diseño. Solo en desarrollo (§11, Fase 1). */}
            {enDesarrollo && <Route path="/_ui" element={<UiKitPage />} />}

            {/* TODO Fase 2: /login, /403, shell por rol y guardas de ruta. */}
            <Route path="*" element={<Navigate to={enDesarrollo ? '/_ui' : '/login'} replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  )
}
