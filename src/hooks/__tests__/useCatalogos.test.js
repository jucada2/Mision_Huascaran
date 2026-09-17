// La grilla de rúbrica (P5) arma los selectores con este agrupamiento: si las
// claves no calzan con el catálogo, los selectores salen vacíos sin avisar.
import { describe, expect, it } from 'vitest'
import { agruparNivelesRubrica } from '../useCatalogos'
import { NIVELES_RUBRICA } from '../../api/mock/db'

describe('agruparNivelesRubrica', () => {
  const agrupados = agruparNivelesRubrica(NIVELES_RUBRICA)

  it('separa por programa y dimensión con las claves del backend', () => {
    expect(agrupados[1].Fluidez.map((n) => n.nombre_nivel)).toEqual([
      'Pre Inicio', 'Inicio', 'Proceso', 'Logrado', 'Destacado',
    ])
    expect(agrupados[1]['Comprensión']).toHaveLength(4)
    expect(agrupados[2].Fluidez).toHaveLength(4)
    expect(agrupados[2]['Comprensión']).toHaveLength(4)
  })

  it('conserva los descriptores por ciclo para el tooltip', () => {
    const logrado = agrupados[2].Fluidez.find((n) => n.nombre_nivel === 'Logrado')
    expect(logrado.descriptores).toHaveProperty('III')
    expect(logrado.descriptores.V).toContain('V')
  })
})
