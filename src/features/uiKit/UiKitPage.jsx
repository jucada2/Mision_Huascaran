// Cubre: sistema de diseño §4 (no cubre RF/RN de negocio).
// Catálogo visual de los componentes base. Solo se monta en desarrollo.
import { useState } from 'react'
import {
  BookOpen,
  GraduationCap,
  Lock,
  Info,
  TrendingUp,
  Users,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  DataTable,
  Drawer,
  EmptyState,
  FilterBar,
  Input,
  LevelChip,
  Logo,
  Modal,
  Select,
  Skeleton,
  StatCard,
  Stepper,
  SyncBadge,
  Tabs,
  Textarea,
  Tooltip,
  TrendIndicator,
  useToast,
} from '../../components/ui'
import imgHeaderHome from '../../assets/img_header_home.jpg'

const NIVELES = ['Pre Inicio', 'Inicio', 'Proceso', 'Logrado', 'Destacado']

const ALUMNOS_DEMO = [
  { id: 1, codigo: 'EST-AMA-1042', nombre: 'Rosa Meléndez Quispe', grado: '3.°', nivel: 'Logrado', letra: 'J', orden: 12, libros: 4, dir: 'up' },
  { id: 2, codigo: 'EST-AMA-1043', nombre: 'Julio Carhuaz Ramos', grado: '3.°', nivel: 'Proceso', letra: 'G', orden: 9, libros: 2, dir: 'flat' },
  { id: 3, codigo: 'EST-AMA-1044', nombre: 'Nayeli Tarazona Cruz', grado: '3.°', nivel: 'Inicio', letra: 'D', orden: 6, libros: 0, dir: 'down' },
  { id: 4, codigo: 'EST-YUN-2011', nombre: 'Edwin Sifuentes Loli', grado: '5.°', nivel: 'Destacado', letra: 'P', orden: 18, libros: 6, dir: 'up' },
  { id: 5, codigo: 'EST-YUN-2012', nombre: 'Mirtha Colonia Vega', grado: '5.°', nivel: 'Pre Inicio', letra: 'aa', orden: 1, libros: 1, dir: 'unknown' },
]

const COLUMNAS = [
  { key: 'codigo', header: 'Código', sortable: true, className: 'font-medium text-ink-900' },
  { key: 'nombre', header: 'Estudiante', sortable: true },
  { key: 'grado', header: 'Grado', align: 'center' },
  {
    key: 'letra',
    header: 'Raz-Kids',
    align: 'center',
    render: (r) => <LevelChip letra={r.letra} orden={r.orden} totalNiveles={29} />,
  },
  {
    key: 'nivel',
    header: 'Nivel general',
    render: (r) => <LevelChip nivel={r.nivel} />,
  },
  { key: 'libros', header: 'Libros', align: 'right', sortable: true },
  {
    key: 'dir',
    header: 'Tendencia',
    render: (r) => <TrendIndicator dir={r.dir} />,
  },
]

export default function UiKitPage() {
  const toast = useToast()
  const [tab, setTab] = useState('componentes')
  const [paso, setPaso] = useState(1)
  const [modal, setModal] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const [observacion, setObservacion] = useState('Faltó dos sesiones por lluvia.')
  const [busqueda, setBusqueda] = useState('')

  return (
    <div className="min-h-screen bg-surface-50">
      <header className="sticky top-0 z-30 border-b border-line bg-navy-900 px-5 py-3">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <Logo tone="light" />
          <div className="flex items-center gap-3">
            <SyncBadge pendientes={0} />
            <Badge tone="info">Solo desarrollo</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-5">
        <h1 className="text-2xl font-bold text-ink-900 md:text-3xl">Sistema de diseño</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-500">
          Catálogo de los componentes base de SICEDU. Todo color, radio y espaciado sale de los
          tokens declarados en <code className="rounded bg-surface-100 px-1">tailwind.config.js</code>.
        </p>

        <Tabs
          className="mt-6"
          value={tab}
          onChange={setTab}
          items={[
            { value: 'componentes', label: 'Componentes' },
            { value: 'paleta', label: 'Paleta' },
            { value: 'tipografia', label: 'Tipografía' },
          ]}
        />

        {tab === 'componentes' && (
          <div className="mt-6 flex flex-col gap-5">
            <MarcaCard />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={Users} label="Mis estudiantes" value="87" hint="2 colegios" />
              <StatCard
                icon={BookOpen}
                label="Reporte de esta semana"
                value="64 / 87"
                trend={{ dir: 'up', label: 'Mejora', value: '+12' }}
              />
              <StatCard icon={GraduationCap} label="Pendientes de rúbrica" value="23" hint="Semana 14" />
              <StatCard icon={TrendingUp} label="Ajustes por revisar" value="5" trend={{ dir: 'down' }} />
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Card title="Botones" subtitle="Variantes y tamaños">
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="primary">Primario</Button>
                  <Button variant="secondary">Secundario</Button>
                  <Button variant="outline">Contorno</Button>
                  <Button variant="ghost">Fantasma</Button>
                  <Button variant="danger">Peligro</Button>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button size="sm" iconLeft={BookOpen}>Con icono</Button>
                  <Button size="sm" loading>Guardando</Button>
                  <Button size="sm" disabled>Deshabilitado</Button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                  <Button size="sm" variant="outline" onClick={() => toast.success('Semana guardada', 'Se registraron 87 filas.')}>
                    Toast éxito
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.error('No se pudo conectar', 'El envío quedó en la cola local.')}>
                    Toast error
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.warning('Faltan dimensiones de rúbrica')}>
                    Toast aviso
                  </Button>
                </div>
              </Card>

              <Card title="Campos de formulario" subtitle="Etiqueta, ayuda, error y contador">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label="Correo" type="email" required placeholder="docente@misionhuascaran.org" />
                  <Input label="Contraseña" type="password" required hint="Mínimo 8 caracteres" />
                  <Select
                    label="Fluidez lectora"
                    required
                    placeholder="Seleccione"
                    options={NIVELES}
                    error="Ambas dimensiones son obligatorias"
                  />
                  <Input label="Nivel inicial Raz-Kids" value="F" disabled hint="Automático — no editable" />
                  <Textarea
                    className="sm:col-span-2"
                    label="Observación"
                    maxLength={500}
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                  />
                </div>
              </Card>
            </div>

            <Card title="Distintivos e indicadores" subtitle="Badge, LevelChip y TrendIndicator">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>Neutral</Badge>
                <Badge tone="info">Pendiente</Badge>
                <Badge tone="success">Revisado</Badge>
                <Badge tone="warning">Modificado por docente</Badge>
                <Badge tone="danger">Con error</Badge>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                {NIVELES.map((n) => (
                  <LevelChip key={n} nivel={n} />
                ))}
                <span className="mx-2 h-5 w-px bg-line" />
                {['aa', 'C', 'G', 'M', 'Z2'].map((l, i) => (
                  <LevelChip key={l} letra={l} orden={[1, 5, 12, 20, 28][i]} totalNiveles={29} />
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-line pt-4">
                <TrendIndicator dir="up" />
                <TrendIndicator dir="flat" />
                <TrendIndicator dir="down" />
                <TrendIndicator dir="unknown" />
                <Tooltip content="Descriptor oficial del nivel según el ciclo evaluado del estudiante.">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
                    <Info className="h-4 w-4" /> Tooltip (pase el cursor)
                  </span>
                </Tooltip>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-4">
                <SyncBadge pendientes={0} />
                <SyncBadge pendientes={3} />
                <SyncBadge pendientes={3} sincronizando />
                <SyncBadge pendientes={7} error />
              </div>
            </Card>

            <FilterBar
              search={busqueda}
              onSearchChange={setBusqueda}
              searchPlaceholder="Buscar por nombre o código"
              onApply={() => toast.info('Filtros aplicados')}
              onClear={() => setBusqueda('')}
              activeCount={2}
            >
              <Select label="Colegio" placeholder="Todos" options={['I.E. Amauta', 'I.E. Yungay']} />
              <Select label="Grado" placeholder="Todos" options={['1.°', '2.°', '3.°']} />
              <Select label="Programa" placeholder="Todos" options={['Alfabetización', 'Comprensión Lectora']} />
              <Select label="Periodo" placeholder="Todos" options={['Abril', 'Julio', 'Octubre', 'Diciembre']} />
            </FilterBar>

            <Card
              title="Tabla de datos"
              subtitle="Orden, paginación y desplazamiento dentro de la tarjeta"
              padded={false}
              actions={
                <>
                  <Button size="sm" variant="outline" onClick={() => setDrawer(true)}>
                    Abrir panel
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setModal(true)}>
                    Abrir modal
                  </Button>
                </>
              }
            >
              <DataTable
                columns={COLUMNAS}
                rows={ALUMNOS_DEMO}
                initialPageSize={5}
                footNote="Cero libros es un valor válido en semanas sin actividad lectiva."
              />
            </Card>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Card title="Pasos" subtitle="Formulario guiado de 3 pasos">
                <Stepper
                  steps={['Seleccionar estudiante', 'Registrar evaluación', 'Revisar y guardar']}
                  current={paso}
                  onStepClick={setPaso}
                />
                <div className="mt-5 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPaso((p) => Math.max(0, p - 1))}>
                    Anterior
                  </Button>
                  <Button size="sm" onClick={() => setPaso((p) => Math.min(2, p + 1))}>
                    Siguiente
                  </Button>
                </div>
              </Card>

              <Card title="Estado vacío" padded={false}>
                <EmptyState
                  icon={Lock}
                  title="No tiene permisos para acceder a esta sección"
                  description="Ingresó con el rol Profesor. Vuelva a su panel para continuar."
                  action={<Button variant="primary">Volver al inicio</Button>}
                />
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <Card title="Carga · tarjeta"><Skeleton variant="card" /></Card>
              <Card title="Carga · tabla"><Skeleton variant="table" rows={4} /></Card>
              <Card title="Carga · gráfico"><Skeleton variant="chart" /></Card>
            </div>
          </div>
        )}

        {tab === 'paleta' && <PaletaTab />}
        {tab === 'tipografia' && <TipografiaTab />}
      </main>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Trazabilidad de la evaluación"
        subtitle="Rosa Meléndez Quispe · Julio"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(false)}>Cerrar</Button>
            <Button onClick={() => setModal(false)}>Entendido</Button>
          </>
        }
      >
        <p className="text-sm text-ink-700">
          Contenido de ejemplo. El modal cierra con Escape y con clic fuera.
        </p>
      </Modal>

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title="Editar evaluación"
        subtitle="Rosa Meléndez Quispe · 3.° · I.E. Amauta"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDrawer(false)}>Cancelar</Button>
            <Button variant="secondary">Guardar borrador</Button>
            <Button onClick={() => setDrawer(false)}>Confirmar</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Select label="Fluidez lectora" required placeholder="Seleccione" options={NIVELES} />
          <Select label="Comprensión lectora" required placeholder="Seleccione" options={NIVELES} />
          <Input label="Nivel inicial Raz-Kids" value="F" disabled hint="Automático (RN-005)" />
        </div>
      </Drawer>
    </div>
  )
}

/**
 * Comprobación de los dos assets oficiales (§4.4): el logo debe verse blanco
 * sobre navy y azul sobre fondo claro con el mismo componente, y la fotografía
 * solo se usa con su velo, exclusivamente en el panel izquierdo del login.
 */
function MarcaCard() {
  return (
    <Card title="Marca y assets" subtitle="logo_MH.png · img_header_home.jpg">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-6 rounded-xl bg-navy-900 p-5">
            <Logo tone="light" size="lg" />
            <Logo tone="light" size="md" showLabel={false} />
          </div>
          <div className="flex flex-wrap items-center gap-6 rounded-xl border border-line bg-surface-0 p-5">
            <Logo tone="dark" size="lg" />
            <Logo tone="dark" size="md" showLabel={false} />
          </div>
          <p className="text-xs text-ink-500">
            El PNG entregado es blanco con canal alfa. Se usa como máscara CSS y el relleno lo pone
            <code className="mx-1 rounded bg-surface-100 px-1">currentColor</code>, de modo que un
            mismo componente sirve en los dos fondos.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="relative h-56 overflow-hidden rounded-xl">
            <img
              src={imgHeaderHome}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-[52%_30%]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-navy-900/85 via-navy-900/10 to-navy-900/50"
            />
            <div className="absolute inset-0 flex flex-col justify-between p-5">
              <Logo tone="light" />
              <div>
                <p className="font-display text-xl font-bold leading-snug text-white">
                  El avance lector de cada estudiante, en un solo lugar
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {['413 estudiantes', '9 colegios', 'Callejón de Huaylas'].map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/25 bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-ink-500">
            Tratamiento exacto del panel izquierdo del login (P1). Esta fotografía no se usa como
            fondo en ninguna otra pantalla.
          </p>
        </div>
      </div>
    </Card>
  )
}

// El color se pinta con su valor literal y no con una clase `bg-${token}`:
// Tailwind solo genera las clases que encuentra escritas completas en el código.
const GRUPOS_PALETA = [
  { nombre: 'navy', tonos: [['navy-900', '#0A2249'], ['navy-800', '#0E2E5E'], ['navy-700', '#123A75']] },
  {
    nombre: 'brand',
    tonos: [['brand-700', '#10428F'], ['brand-600', '#1D4ED8'], ['brand-500', '#2563EB'], ['brand-100', '#E6EEFB'], ['brand-50', '#F2F6FD']],
  },
  { nombre: 'ink', tonos: [['ink-900', '#0F1E3D'], ['ink-700', '#33415A'], ['ink-500', '#5B6577'], ['ink-400', '#8A94A6']] },
  {
    nombre: 'surface / line',
    tonos: [['surface-0', '#FFFFFF'], ['surface-50', '#F5F8FD'], ['surface-100', '#EEF2F9'], ['line', '#E2E8F2'], ['line-strong', '#CFD8E6']],
  },
  {
    nombre: 'estado',
    tonos: [['success-600', '#17795A'], ['warning-600', '#946200'], ['danger-600', '#B3261E'], ['info-600', '#1D4ED8']],
  },
  {
    nombre: 'lvl',
    tonos: [['lvl-preinicio', '#6D28D9'], ['lvl-inicio', '#B3261E'], ['lvl-proceso', '#946200'], ['lvl-logrado', '#17795A'], ['lvl-destacado', '#10428F']],
  },
]

function PaletaTab() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
      {GRUPOS_PALETA.map((g) => (
        <Card key={g.nombre} title={g.nombre}>
          <div className="flex flex-wrap gap-3">
            {g.tonos.map(([token, hex]) => (
              <div key={token} className="w-28">
                <div className="h-12 rounded-lg border border-line" style={{ backgroundColor: hex }} />
                <p className="mt-1 text-xs font-medium text-ink-700">{token}</p>
                <p className="text-xs tabular-nums text-ink-400">{hex}</p>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}

function TipografiaTab() {
  return (
    <Card className="mt-6" title="Escala tipográfica" subtitle="Poppins para títulos · Inter para interfaz">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">H1 · text-2xl md:text-3xl font-bold</p>
          <h1 className="text-2xl font-bold md:text-3xl">Registro de vuelo</h1>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">H2 · text-xl font-semibold</p>
          <h2 className="text-xl font-semibold">Histórico de evaluaciones</h2>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">H3 · text-base font-semibold</p>
          <h3 className="text-base font-semibold">Sugerencia calculada</h3>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Cuerpo · text-sm</p>
          <p className="text-sm">
            El sistema sugirió F al considerar 4/5, Fluidez en proceso y Comprensión lograda.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Números · tabular-nums</p>
          <p className="text-sm tabular-nums">413 estudiantes · 9 colegios · 18 semanas</p>
        </div>
      </div>
    </Card>
  )
}
