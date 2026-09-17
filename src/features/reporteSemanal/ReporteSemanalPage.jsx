// Cubre: RF-012, RF-013, RF-015, RF-016, RF-017, RF-025, RN-006, RN-007, RN-008,
//        RN-016, RN-024, RNF-001, RNF-006
import AvisoModoConsulta from '../../components/layout/AvisoModoConsulta'
import FilterBar from '../../components/ui/FilterBar'
import GrillaRubrica from '../rubricaSemanal/GrillaRubrica'
import GrillaSemanal from './GrillaSemanal'
import Select from '../../components/ui/Select'
import Tabs from '../../components/ui/Tabs'
import useFiltrosSemanales from './useFiltrosSemanales'
import { etiquetaDeSemana } from '../../lib/format'

/**
 * Pantalla de captura del docente. Dos pestañas sobre la misma grilla de
 * alumnos: el reporte semanal (P4) y la rúbrica semanal (P5).
 */
export default function ReporteSemanalPage() {
  const { semanas, colegios, grados, idSemana, idColegio, idGrado, pestana, puedeEditar, cambiar } =
    useFiltrosSemanales()

  const soloLectura = !puedeEditar
  const filtrosListos = Boolean(idSemana && idColegio && idGrado)

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-bold text-ink-900 md:text-3xl">Captura semanal</h1>
        <p className="mt-1 text-sm text-ink-500">
          Todos sus estudiantes en una sola grilla: no hace falta entrar alumno por alumno.
        </p>
      </header>

      {soloLectura && idColegio && <AvisoModoConsulta />}

      <FilterBar>
        <Select
          label="Semana"
          value={idSemana ?? ''}
          onChange={(e) => cambiar('semana', e.target.value)}
          options={semanas.map((s) => ({ value: s.id_semana, label: etiquetaDeSemana(s) }))}
        />
        <Select
          label="Colegio"
          value={idColegio ?? ''}
          onChange={(e) => cambiar('colegio', e.target.value)}
          options={colegios.map((c) => ({ value: c.id_colegio, label: c.nombre }))}
        />
        <Select
          label="Grado"
          value={idGrado ?? ''}
          onChange={(e) => cambiar('grado', e.target.value)}
          options={grados.map((g) => ({ value: g, label: `${g}.° grado` }))}
        />
      </FilterBar>

      <Tabs
        value={pestana}
        onChange={(valor) => cambiar('vista', valor === 'semanal' ? null : valor)}
        items={[
          { value: 'semanal', label: 'Reporte semanal' },
          { value: 'rubrica', label: 'Rúbrica' },
        ]}
      />

      {filtrosListos &&
        (pestana === 'rubrica' ? (
          <GrillaRubrica
            idSemana={idSemana}
            idColegio={idColegio}
            idGrado={idGrado}
            soloLectura={soloLectura}
          />
        ) : (
          <GrillaSemanal
            idSemana={idSemana}
            idColegio={idColegio}
            idGrado={idGrado}
            soloLectura={soloLectura}
          />
        ))}
    </div>
  )
}
