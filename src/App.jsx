import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from './components/ui'
import AuthProvider from './auth/AuthProvider'
import RutasApp from './rutas'

/**
 * Router y proveedores de la aplicación.
 *
 * RNF-001: la política de reintentos de TanStack Query es la espera creciente de
 * 1s / 4s / 9s exigida por el requerimiento. Las mutaciones de captura no se
 * reintentan aquí: pasan por la cola en IndexedDB, que controla su propia
 * idempotencia (ver `hooks/useOfflineQueue.js`).
 */
const ESPERAS_MS = [1000, 4000, 9000]

export function crearQueryClient() {
  return new QueryClient({
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
}

const queryClient = crearQueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <RutasApp />
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  )
}
