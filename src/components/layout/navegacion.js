// Menú lateral y etiquetas de las migas de pan, en una sola constante (§5).
// Nada de condicionales de rol repartidos por los componentes: si un rol no debe
// ver un enlace, no está en su lista de aquí — y además `RoleRoute` bloquea la
// ruta, porque ocultar el enlace no es una medida de seguridad (RNF-004).
import {
  AlertTriangle,
  ClipboardCheck,
  ClipboardList,
  FileDown,
  Home,
  Layers,
  LayoutDashboard,
  Plane,
  School,
  Settings,
  Users,
} from 'lucide-react'
import { ROLES } from '../../auth/roles'

export const NAV_BY_ROLE = {
  [ROLES.PROFESOR]: [
    { to: '/inicio', label: 'Inicio', icon: Home },
    { to: '/reporte-semanal', label: 'Reporte semanal', icon: ClipboardList },
    { to: '/registro-vuelo', label: 'Registro de vuelo', icon: Plane },
    { to: '/estudiantes', label: 'Estudiantes', icon: Users },
    { to: '/nivel-final', label: 'Nivel final', icon: ClipboardCheck },
    { to: '/consulta-colegios', label: 'Consulta de colegios', icon: School },
  ],
  [ROLES.JEFA]: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/colegios', label: 'Colegios y ranking', icon: School },
    { to: '/estudiantes', label: 'Estudiantes', icon: Users },
    { to: '/registro-vuelo', label: 'Registro de vuelo', icon: Plane },
    { to: '/nivel-final', label: 'Nivel final', icon: ClipboardCheck },
    { to: '/consolidados', label: 'Consolidados', icon: Layers },
    { to: '/alertas', label: 'Alertas', icon: AlertTriangle },
    { to: '/administracion', label: 'Administración', icon: Settings },
  ],
  [ROLES.DIRECTIVOS]: [
    { to: '/panel-ejecutivo', label: 'Panel ejecutivo', icon: LayoutDashboard },
    { to: '/colegios', label: 'Colegios', icon: School },
    { to: '/estudiantes', label: 'Estudiantes', icon: Users },
    { to: '/reportes', label: 'Reportes', icon: FileDown },
  ],
}

export const navegacionDe = (idRol) => NAV_BY_ROLE[idRol] ?? []

/** Etiqueta de cada segmento de URL para las migas de pan (P2). */
export const ETIQUETAS_RUTA = {
  inicio: 'Inicio',
  'reporte-semanal': 'Reporte semanal',
  'registro-vuelo': 'Registro de Vuelo',
  nuevo: 'Nueva evaluación',
  estudiantes: 'Estudiantes',
  'nivel-final': 'Nivel final mensual',
  'consulta-colegios': 'Consulta de colegios',
  dashboard: 'Dashboard',
  colegios: 'Colegios',
  consolidados: 'Consolidados',
  alertas: 'Alertas',
  administracion: 'Administración',
  'panel-ejecutivo': 'Panel ejecutivo',
  reportes: 'Reportes',
  403: 'Sin permisos',
}

export const etiquetaDeSegmento = (segmento) =>
  ETIQUETAS_RUTA[segmento] ?? (/^\d+$/.test(segmento) ? 'Detalle' : segmento)
