// Cola de envíos pendientes (RNF-001).
//
// Lo que exige el requerimiento y cómo se cumple:
//  - el guardado nunca bloquea la interfaz → la fila se da por guardada en local
//    apenas se encola, y el envío ocurre después;
//  - hasta 3 reintentos con espera creciente → 1s, 4s y 9s;
//  - sin duplicar → cada envío lleva una `idempotency_key` (`alumno-semana`) y
//    la cola guarda un solo elemento por clave: si el docente vuelve a editar la
//    misma fila, se reemplaza el pendiente en vez de agregar otro. Si el
//    servidor ya había aceptado un envío que el cliente creyó fallido, el
//    reintento llega con la misma clave y el servidor lo trata como el mismo
//    registro.
//
// La cola vive en IndexedDB para sobrevivir a un cierre del navegador en pleno
// corte de conexión. Si IndexedDB no está disponible, sigue funcionando en
// memoria: el objetivo es no perder el trabajo del docente, no la persistencia.
import { get, set } from 'idb-keyval'
import useSyncStore from '../store/syncStore'

const CLAVE_IDB = 'sicedu.cola-envios'
const ESPERAS_MS = [1000, 4000, 9000]
export const MAX_INTENTOS = ESPERAS_MS.length

const enviadores = new Map()
const promesas = new Map()

let cola = []
let iniciada = false
let procesando = false
let temporizador = null

/** Cada tipo de envío declara cómo se manda al servidor. */
export function registrarEnviador(tipo, enviar) {
  enviadores.set(tipo, enviar)
}

function publicarEstado() {
  useSyncStore.getState().setPendientes(
    cola.map(({ clave, tipo, descripcion, intentos, error }) => ({ clave, tipo, descripcion, intentos, error })),
  )
}

async function persistir() {
  publicarEstado()
  try {
    await set(CLAVE_IDB, cola)
  } catch {
    // Sin IndexedDB (navegación privada, jsdom) la cola sigue en memoria.
  }
}

function resolverPromesa(clave, valor) {
  promesas.get(clave)?.resolve(valor)
  promesas.delete(clave)
}

function rechazarPromesa(clave, error) {
  promesas.get(clave)?.reject(error)
  promesas.delete(clave)
}

/** Un 4xx no se arregla reintentando; un corte de red o un 5xx, sí. */
function esReintentable(error) {
  const estado = error?.response?.status
  if (estado == null) return true
  if (estado === 408 || estado === 429) return true
  return estado >= 500
}

function programar(ms) {
  clearTimeout(temporizador)
  temporizador = setTimeout(() => procesar(), ms)
}

async function procesar() {
  if (procesando || cola.length === 0) return
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    useSyncStore.getState().terminarSincronizacion(null)
    return
  }

  procesando = true
  useSyncStore.getState().iniciarSincronizacion()

  try {
    while (cola.length > 0) {
      const item = cola[0]
      const enviar = enviadores.get(item.tipo)

      if (!enviar) {
        // Tipo desconocido: se descarta para no dejar la cola trabada.
        cola.shift()
        rechazarPromesa(item.clave, new Error(`Sin enviador para "${item.tipo}"`))
        await persistir()
        continue
      }

      try {
        const respuesta = await enviar({ ...item.payload, idempotency_key: item.clave })
        cola.shift()
        await persistir()
        resolverPromesa(item.clave, respuesta)
      } catch (error) {
        const mensaje = error?.response?.data?.detail ?? error?.message ?? 'Error de envío'

        if (!esReintentable(error)) {
          cola.shift()
          await persistir()
          rechazarPromesa(item.clave, error)
          continue
        }

        item.intentos += 1
        item.error = mensaje
        await persistir()

        if (item.intentos >= MAX_INTENTOS) {
          // Se agotaron los tres intentos: queda en la cola, visible en el
          // SyncBadge, esperando el "Reintentar ahora" del docente.
          useSyncStore.getState().terminarSincronizacion(mensaje)
          rechazarPromesa(item.clave, error)
          return
        }

        programar(ESPERAS_MS[item.intentos - 1])
        useSyncStore.getState().terminarSincronizacion(null)
        return
      }
    }

    useSyncStore.getState().terminarSincronizacion(null)
  } finally {
    procesando = false
  }
}

/**
 * Agrega (o reemplaza) un envío. Devuelve una promesa que se resuelve cuando el
 * servidor lo acepta y se rechaza cuando se agotan los reintentos, para que la
 * fila pueda mostrar su estado sin saber nada de la cola.
 */
export function encolar({ clave, tipo, payload, descripcion }) {
  const anterior = cola.findIndex((item) => item.clave === clave)
  const item = {
    clave,
    tipo,
    payload,
    descripcion,
    intentos: 0,
    error: null,
    creado: new Date().toISOString(),
  }

  if (anterior >= 0) {
    // La edición más reciente reemplaza a la pendiente: nunca dos envíos de la
    // misma fila-semana en la cola.
    cola[anterior] = item
    resolverPromesa(clave, { reemplazado: true })
  } else {
    cola.push(item)
  }

  const promesa = new Promise((resolve, reject) => promesas.set(clave, { resolve, reject }))
  persistir().then(() => procesar())
  return promesa
}

/** Reintento manual desde el panel del SyncBadge. */
export function reintentarAhora() {
  cola.forEach((item) => {
    item.intentos = 0
    item.error = null
  })
  clearTimeout(temporizador)
  return persistir().then(() => procesar())
}

/** Carga la cola guardada y se suscribe a la vuelta de la conexión. */
export async function iniciarCola() {
  if (iniciada) return
  iniciada = true

  try {
    const guardada = await get(CLAVE_IDB)
    if (Array.isArray(guardada) && guardada.length > 0) {
      cola = guardada
      publicarEstado()
    }
  } catch {
    // Sin IndexedDB no hay nada que recuperar.
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => procesar())
  }

  if (cola.length > 0) procesar()
}

/** Solo para los tests: deja la cola como recién abierta. */
export function _reiniciarCola() {
  cola = []
  promesas.clear()
  iniciada = false
  procesando = false
  clearTimeout(temporizador)
  publicarEstado()
}
