// Todas las rutas del backend en un solo lugar (§3). Ningún componente escribe
// una URL a mano: si Swagger cambia una ruta, se corrige aquí y nada más.
//
// Las rutas marcadas con POR CONFIRMAR todavía no existen en el backend; están
// tomadas del contrato provisional de §3 y deben verificarse contra
// {API_BASE_URL}/docs cuando el equipo de backend las publique.
export const ENDPOINTS = {
  auth: {
    login: '/login',
    logout: '/logout',
    me: '/me',
  },

  // POR CONFIRMAR ────────────────────────────────────────────────────────────
  catalogos: {
    colegios: '/colegios',
    grados: '/grados',
    programas: '/programas',
    nivelesRazkids: '/niveles/razkids',
    nivelesRubrica: '/niveles/rubrica', // ?programa=
    nivelGeneral: '/niveles/general',
    esperadoPorGrado: '/niveles/esperado-por-grado',
    periodos: '/periodos-evaluacion',
    semanas: '/semanas',
  },

  alumnos: {
    listar: '/alumnos', // ?colegio=&grado=&programa=&q=
    detalle: (id) => `/alumnos/${id}`,
    historial: (id) => `/alumnos/${id}/historial`,
  },

  reporteSemanal: {
    listar: '/reporte-semanal', // ?semana=&colegio=&grado=
    crear: '/reporte-semanal',
    actualizar: (id) => `/reporte-semanal/${id}`,
    agregarLibro: (id) => `/reporte-semanal/${id}/libros`,
    eliminarLibro: (idLibro) => `/reporte-semanal/libros/${idLibro}`,
  },

  rubricaSemanal: {
    listar: '/rubrica-semanal', // ?semana=&colegio=&grado=
    crear: '/rubrica-semanal',
  },

  evaluacionDiagnostica: {
    listar: '/evaluacion-diagnostica', // ?periodo=&colegio=&grado=
    crear: '/evaluacion-diagnostica',
    actualizar: (id) => `/evaluacion-diagnostica/${id}`,
  },

  nivelFinalMensual: {
    listar: '/nivel-final-mensual', // ?mes=&colegio=&grado=
    ajustar: (id) => `/nivel-final-mensual/${id}/ajuste`,
  },

  dashboard: {
    indicadores: '/dashboard/indicadores',
    distribucion: '/dashboard/distribucion',
    rankingColegios: '/dashboard/ranking-colegios',
    rankingAulas: '/dashboard/ranking-aulas',
  },

  consolidados: {
    nivel: '/consolidados/nivel',
    libros: '/consolidados/libros',
  },

  alertas: {
    inconsistencias: '/alertas/inconsistencias',
  },
}

export default ENDPOINTS
