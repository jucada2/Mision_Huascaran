// Resuelve cada endpoint contra `db.js` con un retardo de 300ms (§3), para que
// los estados de carga de la interfaz se vean como se verán con el backend real.
//
// Los errores imitan la forma de un error de axios (`error.response.status`), de
// modo que el resto de la aplicación trata igual al mock y a la API.
import * as db from './db'

const RETARDO_MS = 300

function copiar(datos) {
  return typeof structuredClone === 'function' ? structuredClone(datos) : JSON.parse(JSON.stringify(datos))
}

function responder(datos, ms = RETARDO_MS) {
  return new Promise((resolver) => setTimeout(() => resolver(copiar(datos)), ms))
}

function errorHttp(status, detail) {
  const error = new Error(detail)
  error.isAxiosError = true
  error.response = { status, data: { detail } }
  return error
}

/** Token de mentira con la forma `mock.<id_usuario>.<año lectivo>`. */
const armarToken = (idUsuario) => `mock.${idUsuario}.${db.ANIO_LECTIVO}`

function usuarioDeToken(token) {
  const idUsuario = Number(String(token ?? '').split('.')[1])
  return db.USUARIOS.find((u) => u.id_usuario === idUsuario) ?? null
}

/** El usuario que viaja al cliente nunca lleva credenciales. */
const perfilPublico = (usuario) => ({
  id_usuario: usuario.id_usuario,
  id_rol: usuario.id_rol,
  correo: usuario.correo,
  id_docente: usuario.id_docente,
  nombres: usuario.nombres,
})

export const handlers = {
  auth: {
    async login({ correo, password }) {
      const usuario = db.USUARIOS.find((u) => u.correo.toLowerCase() === String(correo ?? '').trim().toLowerCase())
      // P1: un 401 nunca revela cuál de los dos campos falló.
      if (!usuario || password !== db.CLAVE_DEMO) throw errorHttp(401, 'Credenciales inválidas')
      return responder({ access_token: armarToken(usuario.id_usuario), token_type: 'bearer' })
    },

    async me(token) {
      const usuario = usuarioDeToken(token)
      if (!usuario) throw errorHttp(401, 'No autenticado')
      return responder(perfilPublico(usuario), 150)
    },

    async logout() {
      // JWT stateless: el cierre real es borrar el token en el cliente (§3).
      return responder({ ok: true }, 80)
    },
  },

  catalogos: {
    colegios: () => responder(db.COLEGIOS),
    grados: () => responder(db.GRADOS),
    programas: () => responder(db.PROGRAMAS),
    ciclos: () => responder(db.CICLOS),
    nivelesRazkids: () => responder(db.NIVELES_RAZKIDS),
    nivelesRubrica: ({ programa } = {}) =>
      responder(
        programa ? db.NIVELES_RUBRICA.filter((n) => n.id_programa === Number(programa)) : db.NIVELES_RUBRICA,
      ),
    nivelGeneral: () => responder(db.NIVEL_GENERAL),
    esperadoPorGrado: () => responder(db.NIVEL_ESPERADO_POR_GRADO),
    periodos: () => responder(db.PERIODOS),
    semanas: () => responder(db.SEMANAS),
  },
}

export default handlers
