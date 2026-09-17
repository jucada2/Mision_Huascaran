// Cubre: RNF-004
import { Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import EmptyState from '../../components/ui/EmptyState'
import Logo from '../../components/ui/Logo'
import useSessionStore from '../../store/sessionStore'
import { NOMBRE_ROL, rutaInicioDe } from '../../auth/roles'

/** Destino de todo intento de entrar a una ruta ajena al rol (P18). */
export default function ForbiddenPage() {
  const navegar = useNavigate()
  const usuario = useSessionStore((s) => s.usuario)
  const nombreRol = NOMBRE_ROL[usuario?.id_rol]

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-surface-50 px-6 py-12">
      <Logo tone="dark" size="lg" />

      <Card className="w-full max-w-md" padded={false}>
        <EmptyState
          icon={Lock}
          title="No tiene permisos para acceder a esta sección"
          description={
            nombreRol
              ? `Ingresó con el rol ${nombreRol}, que no tiene habilitada esta pantalla.`
              : 'Su sesión no tiene un rol válido. Vuelva a iniciar sesión.'
          }
          action={
            <Button onClick={() => navegar(usuario ? rutaInicioDe(usuario.id_rol) : '/login', { replace: true })}>
              {usuario ? 'Volver a mi inicio' : 'Ir al inicio de sesión'}
            </Button>
          }
        />
      </Card>
    </div>
  )
}
