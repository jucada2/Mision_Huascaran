import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from '../Button'
import DataTable from '../DataTable'
import LevelChip from '../LevelChip'
import RoleGate from '../RoleGate'
import useSessionStore from '../../../store/sessionStore'
import { ROLES } from '../../../auth/roles'

describe('Button', () => {
  it('no dispara onClick mientras está en estado de carga', async () => {
    const alHacerClic = vi.fn()
    render(
      <Button loading onClick={alHacerClic}>
        Guardar
      </Button>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(alHacerClic).not.toHaveBeenCalled()
  })
})

describe('LevelChip', () => {
  it('pinta el nivel con el token de color correspondiente', () => {
    render(<LevelChip nivel="Logrado" />)
    expect(screen.getByText('Logrado').className).toContain('text-lvl-logrado')
  })

  it('colorea la letra Raz-Kids por `orden` y no por la letra (RN-012)', () => {
    render(
      <>
        <LevelChip letra="aa" orden={1} totalNiveles={29} />
        <LevelChip letra="Z2" orden={28} totalNiveles={29} />
      </>,
    )
    // "aa" ordena después de "Z2" como texto, pero su `orden` es menor.
    expect(screen.getByText('aa').className).toContain('text-lvl-preinicio')
    expect(screen.getByText('Z2').className).toContain('text-lvl-destacado')
  })
})

describe('DataTable', () => {
  const columnas = [
    { key: 'nombre', header: 'Estudiante', sortable: true },
    { key: 'libros', header: 'Libros', align: 'right', sortable: true },
  ]
  const filas = [
    { id: 1, nombre: 'Rosa', libros: 4 },
    { id: 2, nombre: 'Julio', libros: 2 },
  ]

  it('informa el rango mostrado', () => {
    render(<DataTable columns={columnas} rows={filas} />)
    expect(screen.getByText(/Mostrando/)).toBeInTheDocument()
  })

  it('muestra el estado vacío cuando no hay filas', () => {
    render(<DataTable columns={columnas} rows={[]} />)
    expect(screen.getByText('Sin registros')).toBeInTheDocument()
  })
})

describe('RoleGate', () => {
  it('oculta los hijos si el rol activo no está permitido', () => {
    useSessionStore.setState({ usuario: { id_rol: ROLES.DIRECTIVOS } })
    render(
      <RoleGate allow={[ROLES.PROFESOR]}>
        <span>Registrar</span>
      </RoleGate>,
    )
    expect(screen.queryByText('Registrar')).not.toBeInTheDocument()
  })

  it('muestra los hijos si el rol activo está permitido', () => {
    useSessionStore.setState({ usuario: { id_rol: ROLES.PROFESOR } })
    render(
      <RoleGate allow={[ROLES.PROFESOR, ROLES.JEFA]}>
        <span>Registrar</span>
      </RoleGate>,
    )
    expect(screen.getByText('Registrar')).toBeInTheDocument()
  })
})
