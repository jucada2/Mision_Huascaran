import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import PantallaPendiente from './components/layout/PantallaPendiente'
import ProtectedRoute from './auth/ProtectedRoute'
import RoleRoute from './auth/RoleRoute'
import ForbiddenPage from './features/errores/ForbiddenPage'
import InicioPage from './features/inicio/InicioPage'
import LoginPage from './features/login/LoginPage'
import ReporteSemanalPage from './features/reporteSemanal/ReporteSemanalPage'
import UiKitPage from './features/uiKit/UiKitPage'
import useSessionStore from './store/sessionStore'
import { ROLES, rutaInicioDe } from './auth/roles'

const { PROFESOR, JEFA, DIRECTIVOS } = ROLES

/**
 * Mapa de rutas protegidas (§5), en una sola tabla.
 *
 * `allow` es la lista de `id_rol` que pueden entrar: cualquier otro rol que
 * escriba la URL a mano termina en /403 (RNF-004). Las pantallas que todavía no
 * toca construir muestran `PantallaPendiente`, pero su guarda ya es la
 * definitiva y está cubierta por los tests.
 */
export const RUTAS_PROTEGIDAS = [
  { path: '/inicio', allow: [PROFESOR], titulo: 'Inicio del docente', elemento: <InicioPage /> },
  { path: '/reporte-semanal', allow: [PROFESOR], titulo: 'Reporte semanal y rúbrica', elemento: <ReporteSemanalPage /> },
  { path: '/registro-vuelo', allow: [PROFESOR, JEFA], titulo: 'Registro de vuelo — histórico', fase: 'Fase 4' },
  { path: '/registro-vuelo/nuevo', allow: [PROFESOR], titulo: 'Registrar evaluación diagnóstica', fase: 'Fase 4' },
  { path: '/estudiantes', allow: [PROFESOR, JEFA, DIRECTIVOS], titulo: 'Estudiantes', fase: 'Fase 5' },
  { path: '/estudiantes/:id', allow: [PROFESOR, JEFA, DIRECTIVOS], titulo: 'Ficha del estudiante', fase: 'Fase 5' },
  { path: '/nivel-final', allow: [PROFESOR, JEFA], titulo: 'Nivel final mensual', fase: 'Fase 5' },
  { path: '/consulta-colegios', allow: [PROFESOR], titulo: 'Consulta de otros colegios', fase: 'Fase 5' },
  { path: '/dashboard', allow: [JEFA], titulo: 'Dashboard consolidado', fase: 'Fase 6' },
  { path: '/colegios', allow: [JEFA, DIRECTIVOS], titulo: 'Colegios y ranking', fase: 'Fase 6' },
  { path: '/colegios/:id', allow: [JEFA, DIRECTIVOS], titulo: 'Detalle del colegio', fase: 'Fase 6' },
  { path: '/consolidados', allow: [JEFA], titulo: 'Consolidados', fase: 'Fase 6' },
  { path: '/alertas', allow: [JEFA], titulo: 'Alertas de inconsistencias', fase: 'Fase 6' },
  { path: '/administracion', allow: [JEFA], titulo: 'Administración', fase: 'Fase 7' },
  { path: '/panel-ejecutivo', allow: [DIRECTIVOS], titulo: 'Panel ejecutivo', fase: 'Fase 7' },
  { path: '/reportes', allow: [DIRECTIVOS], titulo: 'Reportes y descargas', fase: 'Fase 7' },
]

const enDesarrollo = import.meta.env.DEV

/** Una URL desconocida lleva al inicio del rol; sin sesión, al login. */
function Redireccion() {
  const usuario = useSessionStore((s) => s.usuario)
  return <Navigate to={usuario ? rutaInicioDe(usuario.id_rol) : '/login'} replace />
}

export default function RutasApp() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/403" element={<ForbiddenPage />} />
      {/* Catálogo visual del sistema de diseño. Solo en desarrollo (§11, Fase 1). */}
      {enDesarrollo && <Route path="/_ui" element={<UiKitPage />} />}

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          {RUTAS_PROTEGIDAS.map(({ path, allow, titulo, fase, elemento }) => (
            <Route key={path} element={<RoleRoute allow={allow} />}>
              <Route path={path} element={elemento ?? <PantallaPendiente titulo={titulo} fase={fase} />} />
            </Route>
          ))}
        </Route>
      </Route>

      <Route path="*" element={<Redireccion />} />
    </Routes>
  )
}
