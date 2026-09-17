// RNF-004: bloquear el 100% de los accesos cruzados entre roles.
// Este test recorre TODAS las rutas protegidas con los tres roles y comprueba
// que el rol equivocado termina en /403 entrando por URL, no solo que el enlace
// no aparezca en el menú.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import RutasApp, { RUTAS_PROTEGIDAS } from '../../rutas'
import { crearQueryClient } from '../../App'
import { ToastProvider } from '../../components/ui'
import AuthProvider from '../AuthProvider'
import useSessionStore from '../../store/sessionStore'
import { ROLES } from '../roles'

// Los catálogos se sustituyen para que el test hable de guardas y no de
// peticiones: lo que se verifica aquí es quién entra a cada ruta.
vi.mock('../../hooks/useCatalogos', () => ({
  usePeriodos: () => ({ data: [] }),
  useSemanas: () => ({ data: [] }),
  useProgramas: () => ({ data: [] }),
  useNivelesRubrica: () => ({ data: [], isLoading: false }),
  agruparNivelesRubrica: () => ({}),
}))

const USUARIOS_DE_PRUEBA = {
  [ROLES.PROFESOR]: { id_usuario: 1, id_rol: ROLES.PROFESOR, correo: 'p@sicedu.test', nombres: 'Docente de prueba', id_docente: 1 },
  [ROLES.JEFA]: { id_usuario: 4, id_rol: ROLES.JEFA, correo: 'j@sicedu.test', nombres: 'Jefatura de prueba', id_docente: null },
  [ROLES.DIRECTIVOS]: { id_usuario: 5, id_rol: ROLES.DIRECTIVOS, correo: 'd@sicedu.test', nombres: 'Directivo de prueba', id_docente: null },
}

/** `/estudiantes/:id` se visita con un id concreto. */
const urlDe = (path) => path.replace(':id', '1')

function renderRuta(ruta, usuario) {
  useSessionStore.setState({ token: usuario ? 'mock.1.2026' : null, usuario, cargando: false })
  return render(
    <QueryClientProvider client={crearQueryClient()}>
      <ToastProvider>
        <MemoryRouter initialEntries={[ruta]}>
          <AuthProvider>
            <RutasApp />
          </AuthProvider>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  useSessionStore.setState({ token: null, usuario: null, cargando: false })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('guardas de rol (RNF-004)', () => {
  const roles = [ROLES.PROFESOR, ROLES.JEFA, ROLES.DIRECTIVOS]

  RUTAS_PROTEGIDAS.forEach(({ path, allow, titulo, elemento }) => {
    roles.forEach((idRol) => {
      const permitida = allow.includes(idRol)
      it(`${permitida ? 'deja pasar' : 'manda a /403'} al rol ${idRol} en ${path}`, async () => {
        renderRuta(urlDe(path), USUARIOS_DE_PRUEBA[idRol])

        if (permitida) {
          // Las pantallas ya construidas se comprueban por el shell que las
          // envuelve; las que aún son marcador, por su título. En el menú
          // lateral y en las migas hay textos iguales que no probarían nada.
          if (elemento) {
            expect(await screen.findByRole('navigation', { name: 'Menú principal' })).toBeInTheDocument()
          } else {
            expect(await screen.findByRole('heading', { name: titulo })).toBeInTheDocument()
          }
          expect(screen.queryByText(/No tiene permisos/i)).not.toBeInTheDocument()
        } else {
          expect(await screen.findByText(/No tiene permisos para acceder a esta sección/i)).toBeInTheDocument()
          expect(screen.queryByRole('heading', { name: titulo })).not.toBeInTheDocument()
        }
      })
    })
  })

  it('sin sesión, cualquier ruta protegida lleva al login', async () => {
    renderRuta('/dashboard', null)
    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument()
  })

  it('una URL desconocida lleva al inicio del rol', async () => {
    renderRuta('/ruta-que-no-existe', USUARIOS_DE_PRUEBA[ROLES.DIRECTIVOS])
    expect(await screen.findByRole('heading', { name: 'Panel ejecutivo' })).toBeInTheDocument()
  })
})
