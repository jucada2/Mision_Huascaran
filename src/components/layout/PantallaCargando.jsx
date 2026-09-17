import { Loader2 } from 'lucide-react'
import Logo from '../ui/Logo'

/** Pantalla intermedia mientras se verifica la sesión contra /me. */
export default function PantallaCargando({ mensaje = 'Verificando su sesión…' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface-50 px-6">
      <Logo tone="dark" size="lg" />
      <p className="flex items-center gap-2 text-sm text-ink-500">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        {mensaje}
      </p>
    </div>
  )
}
