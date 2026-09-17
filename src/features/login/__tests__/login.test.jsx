// P1 / RF-001: validación del formulario, mensaje único para el 401 y redirección
// por rol después de un ingreso correcto.
import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import RutasApp from '../../../rutas'
import { crearQueryClient } from '../../../App'
import { ToastProvider } from '../../../components/ui'
import AuthProvider from '../../../auth/AuthProvider'
import useSessionStore from '../../../store/sessionStore'
import { CLAVE_DEMO, USUARIOS } from '../../../api/mock/db'

const DOCENTE = USUARIOS.find((u) => u.id_rol === 1)

function renderLogin() {
  return render(
    <QueryClientProvider client={crearQueryClient()}>
      <ToastProvider>
        <MemoryRouter initialEntries={['/login']}>
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
  sessionStorage.clear()
})

describe('LoginPage', () => {
  it('valida el correo y el largo de la contraseña antes de llamar a la API', async () => {
    renderLogin()
    await userEvent.type(screen.getByLabelText(/Correo/), 'no-es-un-correo')
    await userEvent.type(screen.getByLabelText(/Contraseña/), '123')
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByText('Ingrese un correo válido')).toBeInTheDocument()
    expect(screen.getByText('La contraseña debe tener al menos 8 caracteres')).toBeInTheDocument()
  })

  it('ante un 401 no revela cuál de los dos campos falló', async () => {
    renderLogin()
    await userEvent.type(screen.getByLabelText(/Correo/), DOCENTE.correo)
    await userEvent.type(screen.getByLabelText(/Contraseña/), 'claveequivocada')
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos')
  })

  it('con credenciales válidas lleva al inicio que corresponde al rol', async () => {
    renderLogin()
    await userEvent.type(screen.getByLabelText(/Correo/), DOCENTE.correo)
    await userEvent.type(screen.getByLabelText(/Contraseña/), CLAVE_DEMO)
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }))

    // El saludo del panel cambia con la hora; "Accesos rápidos" no.
    expect(await screen.findByRole('heading', { name: 'Accesos rápidos' })).toBeInTheDocument()
    // RNF-003: el token se respalda en sessionStorage, nunca en localStorage.
    expect(sessionStorage.getItem('sicedu.token')).toBeTruthy()
    expect(localStorage.getItem('sicedu.token')).toBeNull()
  })
})
