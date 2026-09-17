# PROMPT MAESTRO — Frontend SICEDU (Misión Huascarán)

> **Cómo usar este archivo:** guárdalo en la raíz del repositorio como `PROMPT_FRONTEND.md`,
> abre Claude Code en VS Code y escribe:
> *"Lee PROMPT_FRONTEND.md completo y ejecútalo. Empieza por la Fase 1 y no avances de fase
> hasta que la anterior compile y se vea correctamente."*
> Adjunta también los archivos `logo_MH.svg` y `img_header_home.jpg` en `src/assets/`.

---

## 0. Tu rol y el objetivo

Eres el desarrollador frontend del proyecto **SICEDU (Sistema de Centralización de Datos
Educativos)**, para la ONG peruana **Misión Huascarán**, en el curso CS3081 Ingeniería de
Software. Debes construir una aplicación web **React + Tailwind en JavaScript** que consume una
API REST hecha en FastAPI.

El sistema reemplaza los archivos Excel con los que hoy 9 colegios de primaria (413 alumnos)
registran el avance lector de sus estudiantes. Tiene **3 roles** con vistas distintas.

**Reglas de trabajo que no puedes romper:**

1. Cada pantalla que construyas debe cubrir requerimientos concretos del documento de
   requerimientos (RF/RNF) y respetar las reglas de negocio (RN). En este archivo cada pantalla
   viene con su lista. **Escribe esos IDs como comentario al inicio de cada archivo de página**
   (ej. `// Cubre: RF-012, RF-015, RF-016, RN-006, RN-007`). Esto es obligatorio: el equipo va a
   documentar el sistema tomando capturas y explicando qué requerimiento cubre cada vista.
2. No inventes reglas de negocio. Si algo no está definido acá, déjalo como `TODO:` visible en el
   código y sigue con lo que sí está definido.
3. No uses TypeScript. JavaScript con JSX.
4. Nada de datos personales reales de menores: los datos de prueba son ficticios.
5. El nombre del producto en la interfaz es **SICEDU**; el logo de Misión Huascarán ya contiene
   el nombre de la ONG, así que **nunca escribas "Misión Huascarán" como texto al lado del logo**.

---

## 1. Contexto funcional (lo que el sistema hace)

El programa de Educación de Misión Huascarán mide el avance lector de cada alumno de primaria
combinando dos fuentes:

- **Raz-Kids** (plataforma de lectura): da un nivel por letras (`aa`, `A`, `B`, … hasta `Z2`) y el
  resultado de una prueba (ej. "3 de 5"). El docente lo transcribe a mano; no hay API.
- **La rúbrica del docente**: evalúa dos dimensiones **siempre juntas** — *Fluidez Lectora* y
  *Comprensión Lectora* — a partir de su observación en el aula.

De la combinación de ambas sale el **nivel final** del alumno (lo que el equipo llama *delta*):
el sistema lo **calcula y sugiere**, y el docente puede **mantenerlo, subirlo o bajarlo**, pero si lo
cambia **debe justificarlo por escrito**. Nunca se sobrescribe el valor de Raz-Kids: los dos
conviven como campos separados.

Hay dos ritmos de captura:

| Captura | Frecuencia | Qué registra |
|---|---|---|
| **Reporte semanal** | 1 vez por semana (solo hay 2 horas de clase con tablets) | asistencia, libros leídos, observación |
| **Registro de vuelo** (evaluación diagnóstica) | 4 veces al año: **abril, julio, octubre, diciembre** | nivel de la prueba, aciertos/total, nivel ajustado, nivel general |
| **Rúbrica semanal** | 1 vez por semana | nivel de Fluidez + nivel de Comprensión |
| **Nivel final mensual** | derivado, 1 vez al mes | nivel calculado + nivel final + ajuste justificado |

Dos conceptos que el frontend **debe** mostrar como datos separados (no los mezcles nunca):

- **Grado nominal** (1.° a 6.°) y **ciclo evaluado** (III, IV, V). Un alumno de 6.° puede ser
  evaluado con la rúbrica del ciclo III.
- **Programa**: *Alfabetización* o *Comprensión Lectora*. El grado NO determina el programa: un
  niño de 5.° puede seguir en Alfabetización.

---

## 2. Stack tecnológico obligatorio

| Capa | Tecnología | Nota |
|---|---|---|
| Librería UI | **React 18** | componentes de función + hooks |
| Lenguaje | **JavaScript (ES2022) + JSX** | sin TypeScript |
| Build | **Vite 5** | `npm create vite@latest -- --template react` |
| Estilos | **Tailwind CSS 3** | tokens en `tailwind.config.js`, sin CSS-in-JS |
| Rutas | **react-router-dom 6** | rutas protegidas por rol |
| Datos del servidor | **@tanstack/react-query 5** | caché, reintentos, estados de carga |
| HTTP | **axios** | una instancia con interceptores |
| Formularios | **react-hook-form** + **zod** (`@hookform/resolvers`) | validación declarativa |
| Gráficos | **recharts** | responsive por defecto |
| Iconos | **lucide-react** | |
| Estado de UI | **zustand** | sesión, filtros globales, cola offline |
| Persistencia local | **idb-keyval** | cola de envíos pendientes (RNF-001) |
| Fechas | **dayjs** | locale `es` |
| Tablas | implementación propia con Tailwind | no instales librerías de tablas |
| Tests | **vitest** + **@testing-library/react** | mínimo: guardas de rol y cálculo de totales |

No agregues dependencias fuera de esta lista sin dejar justificado el motivo en
`STACK_FRONTEND.md`.

**Variables de entorno** (`.env.example`, y `VITE_` como prefijo obligatorio en Vite):

```
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK=true
```

---

## 3. Contrato con el backend

El backend es **FastAPI + PostgreSQL + SQLModel**, con autenticación **JWT propia**
(`python-jose` + `bcrypt`). Documentación viva en `{API_BASE_URL}/docs` (Swagger autogenerado):
**consúltala antes de dar por definitivo cualquier endpoint**.

Lo confirmado hoy:

| Endpoint | Método | Descripción |
|---|---|---|
| `/login` | POST | body `{correo, password}` → `{access_token, token_type:"bearer"}`. Inválido → 401 |
| `/logout` | POST | opcional; el cierre real es borrar el token en el cliente (JWT stateless) |
| `/me` | GET | protegido; devuelve el usuario autenticado (`id_usuario`, `id_rol`, `correo`, `id_docente`, nombres) |

El resto del API está en construcción. Implementa la capa de datos con esta forma y **modo mock
conmutable**:

```
src/api/
├─ client.js          // instancia axios + interceptores (token, 401, reintentos)
├─ endpoints.js       // un objeto con TODAS las rutas en un solo lugar
├─ mock/              // datos ficticios con la misma forma que la API
│  ├─ db.js           // generador determinista (semilla fija)
│  └─ handlers.js     // resuelve cada endpoint desde db.js con delay de 300ms
└─ resources/         // un archivo por dominio: auth, alumnos, semanal, diagnostica, rubrica, dashboard
```

Cada función de `resources/` decide, según `VITE_USE_MOCK`, si llama a axios o al handler mock.
**El resto de la aplicación nunca sabe cuál de los dos está activo.** Cuando el backend esté listo,
cambiar la variable de entorno debe ser suficiente.

Rutas que debes asumir (y corregir contra Swagger cuando exista):

```
GET  /colegios                        GET  /grados
GET  /programas                       GET  /niveles/razkids
GET  /niveles/rubrica?programa=       GET  /niveles/general
GET  /niveles/esperado-por-grado      GET  /periodos-evaluacion
GET  /alumnos?colegio=&grado=&programa=&q=
GET  /alumnos/{id}                    GET  /alumnos/{id}/historial
GET  /semanas
GET  /reporte-semanal?semana=&colegio=&grado=
POST /reporte-semanal                 PUT  /reporte-semanal/{id}
POST /reporte-semanal/{id}/libros     DELETE /reporte-semanal/libros/{id}
GET  /rubrica-semanal?semana=&colegio=&grado=
POST /rubrica-semanal
GET  /evaluacion-diagnostica?periodo=&colegio=&grado=
POST /evaluacion-diagnostica          PUT  /evaluacion-diagnostica/{id}
GET  /nivel-final-mensual?mes=&colegio=&grado=
POST /nivel-final-mensual/{id}/ajuste     // { id_nivel_final, justificacion }
GET  /dashboard/indicadores?programa=&colegio=&grado=&periodo=
GET  /dashboard/distribucion?programa=&dimension=&periodo=
GET  /dashboard/ranking-colegios?programa=&periodo=
GET  /dashboard/ranking-aulas?colegio=&periodo=
GET  /consolidados/nivel?colegio=&periodo=
GET  /consolidados/libros?colegio=&mes=&anio=
GET  /alertas/inconsistencias
```

---

## 4. Sistema de diseño

**Dirección:** institucional, serio y moderno. Interfaz clara de producto de gestión educativa:
barra lateral azul marino, fondo gris azulado muy claro, tarjetas blancas con borde sutil,
esquinas redondeadas medianas, sombras discretas. **Prohibido**: neomorfismo, claymorphism,
sombras de color gruesas, degradados llamativos, glassmorphism, emojis como iconos.

### 4.1 Paleta (defínela en `tailwind.config.js` con estos nombres exactos)

```js
colors: {
  navy:    { 900:'#0A2249', 800:'#0E2E5E', 700:'#123A75' }, // barra lateral, títulos
  brand:   { 700:'#10428F', 600:'#1D4ED8', 500:'#2563EB', 100:'#E6EEFB', 50:'#F2F6FD' },
  ink:     { 900:'#0F1E3D', 700:'#33415A', 500:'#5B6577', 400:'#8A94A6' },
  surface: { 0:'#FFFFFF', 50:'#F5F8FD', 100:'#EEF2F9' },
  line:    { DEFAULT:'#E2E8F2', strong:'#CFD8E6' },
  success: { 600:'#17795A', 500:'#1E9E6A', 100:'#E3F6EC' },
  warning: { 600:'#946200', 500:'#E9A23B', 100:'#FDF3DC' },
  danger:  { 600:'#B3261E', 500:'#DC3545', 100:'#FDE7E9' },
  info:    { 600:'#1D4ED8', 100:'#E6EFFD' },
  // niveles de rúbrica y nivel general (usa SIEMPRE estos, en toda la app)
  lvl: {
    preinicio:'#6D28D9', preinicioBg:'#EDE9FE',
    inicio:'#B3261E',    inicioBg:'#FDE7E9',
    proceso:'#946200',   procesoBg:'#FDF3DC',
    logrado:'#17795A',   logradoBg:'#E3F6EC',
    destacado:'#10428F', destacadoBg:'#E6EEFB',
  }
}
```

Uso del color: **el azul `brand-600` es solo para acciones primarias y elementos activos**. El
color de nivel nunca se usa como fondo de tarjeta grande, solo en chips, celdas de tabla y series
de gráficos.

### 4.2 Tipografía

- Títulos: **Poppins** (600/700) — se acerca a la identidad de Misión Huascarán.
- Texto e interfaz: **Inter** (400/500/600).
- Números en tablas: Inter con `tabular-nums`.
- Carga por Google Fonts en `index.html` y decláralas en `fontFamily` como `display` y `sans`.
- Escala: H1 `text-2xl md:text-3xl font-bold`, H2 `text-xl font-semibold`, H3 `text-base
  font-semibold`, cuerpo `text-sm`, etiquetas `text-xs font-semibold uppercase tracking-wide
  text-ink-400`.

### 4.3 Geometría y elevación

- Radios: tarjetas y contenedores `rounded-xl` (12px); botones e inputs `rounded-lg` (8px);
  chips `rounded-full`.
- Sombra única de tarjeta: `shadow-[0_1px_2px_rgba(15,30,61,0.04),0_8px_24px_rgba(15,30,61,0.06)]`.
- Bordes: `border border-line`.
- Espaciado en múltiplos de 4; padding interno de tarjeta `p-5`; separación entre bloques `gap-5`.
- Foco visible obligatorio: `focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-brand-500 focus-visible:ring-offset-1`.

### 4.4 Assets

- `src/assets/logo_MH.svg` — logo oficial. **Ya trae el nombre de la ONG**. Va solo, con la
  palabra `SICEDU` a su costado como etiqueta (`text-xs font-bold tracking-[0.18em]`), nada
  debajo. En la barra lateral azul el logo va en blanco: el SVG usa `fill="currentColor"`, así que
  se controla con `className="text-white"`. En fondos claros, `text-brand-700`.
- `src/assets/img_header_home.jpg` — fotografía de dos estudiantes. Úsala **solo** en el panel
  izquierdo del login, con `object-cover object-[52%_30%]` y un velo
  `bg-gradient-to-t from-navy-900/85 via-navy-900/10 to-navy-900/50` encima para que el texto
  blanco se lea. No la uses de fondo en ninguna otra pantalla.

### 4.5 Componentes base (`src/components/ui/`)

Construye estos primero, con las variantes indicadas, y **no dupliques estilos en las páginas**:

| Componente | Variantes / props |
|---|---|
| `Button` | `variant`: primary (azul lleno), secondary (`bg-brand-100 text-brand-700`), outline, ghost, danger · `size`: sm/md · `loading`, `iconLeft` |
| `Input`, `Select`, `Textarea` | label, hint, error, `required` (asterisco rojo), contador de caracteres en textarea (`41/500`) |
| `Card` | `title`, `subtitle`, `actions`, `padded` |
| `Badge` | `tone`: neutral/info/success/warning/danger |
| `LevelChip` | `nivel` ("Pre Inicio"…"Destacado") o `letra` Raz-Kids → colores de `lvl` |
| `TrendIndicator` | `dir`: up/down/flat + etiqueta ("Mejora", "Baja", "Estable") con flecha |
| `StatCard` | icono en contenedor `bg-brand-100 rounded-lg`, número grande, etiqueta, variación opcional |
| `DataTable` | columnas configurables, cabecera `bg-surface-100`, filas con hover, orden, estado vacío, paginación ("Mostrando 1 a 5 de 5", selector de registros por página) |
| `FilterBar` | fila de `Select` + buscador + botón "Aplicar filtros"; en móvil colapsa en un `Drawer` |
| `Drawer` | panel lateral derecho, ancho `max-w-md`, para editar sin perder la tabla de fondo |
| `Modal` | centrado, `max-w-2xl`, cierre por Escape y clic fuera |
| `Tabs` | subrayado azul en la pestaña activa |
| `Stepper` | pasos numerados horizontales (1 · 2 · 3), activo en azul, completados con check |
| `Toast` | éxito/error/info, esquina inferior derecha, 4s |
| `EmptyState` | icono, título, descripción, acción |
| `Skeleton` | bloques de carga para tabla, tarjeta y gráfico |
| `SyncBadge` | estado de la cola offline: "Todo sincronizado" / "N pendientes" |
| `RoleGate` | muestra sus hijos solo si el rol está en `allow` |

---

## 5. Roles, rutas y permisos

Tres roles, tal como están en el catálogo `rol` de la base de datos:

| `id_rol` | Nombre | Quién es | Alcance de datos |
|---|---|---|---|
| 1 | `Profesor` | docentes de primaria | **edita** solo los colegios y grados que tiene asignados en el periodo de evaluación vigente; **consulta en modo lectura** los demás colegios |
| 2 | `Jefa_Profesores` | Jefa del Programa de Educación | acceso total a los 9 colegios, sin restricción |
| 3 | `Directivos` | Gerencia y Jefatura de Proyectos Sociales | los mismos datos que Jefa_Profesores, pero **solo lectura y vistas ejecutivas** (sin formularios de captura) |

Reglas de implementación:

- `ProtectedRoute` verifica token; `RoleRoute allow={[1,2]}` verifica rol. Un intento de entrar a
  una ruta ajena redirige a `/403` — **no basta con ocultar el enlace del menú** (RNF-004).
- El alcance del Profesor se resuelve con lo que devuelve el backend, pero la interfaz debe
  reflejarlo: cuando un Profesor abre un colegio que no tiene asignado, la pantalla se muestra en
  **modo lectura** con un aviso fijo arriba: *"Modo consulta — este colegio no está asignado a
  usted en el periodo vigente"*, y todos los controles de edición van `disabled`.
- El menú lateral se arma desde una sola constante `NAV_BY_ROLE`, no con condicionales repartidos.

### Mapa de rutas

```
/login                                  público
/403                                    público

Profesor (rol 1)
/inicio                                 panel del docente
/reporte-semanal                        captura semanal
/registro-vuelo                         histórico de evaluaciones diagnósticas
/registro-vuelo/nuevo                   formulario de 3 pasos
/estudiantes                            listado
/estudiantes/:id                        ficha del estudiante
/nivel-final                            revisión y ajuste del nivel final mensual
/consulta-colegios                      lectura de otros colegios (RF-003)

Jefa_Profesores (rol 2)
/dashboard                              consolidado de los 9 colegios
/colegios                               comparativa + ranking
/colegios/:id                           detalle del colegio
/estudiantes  /estudiantes/:id          los mismos que el Profesor, sin restricción
/consolidados                           consolidados por estudiante / grado / colegio
/alertas                                inconsistencias detectadas
/administracion                         docentes, asignaciones, periodos

Directivos (rol 3)
/panel-ejecutivo                        indicadores de alto nivel
/colegios  /colegios/:id                solo lectura
/reportes                               descargas
```

---

## 6. Especificación pantalla por pantalla

Cada bloque indica el layout, los componentes y **los requerimientos que cubre**. Respeta esos
IDs: el equipo documentará cada captura con ellos.

---

### P1 · Login (`/login`) — pública
**Cubre: RF-001, RNF-002, RNF-003, RNF-004**

Dos columnas a pantalla completa (`grid lg:grid-cols-2`); en móvil solo la columna del formulario.

- **Izquierda:** `img_header_home.jpg` a sangre con el velo azul marino. Arriba a la izquierda, el
  logo en blanco + etiqueta `SICEDU`. Abajo: titular *"El avance lector de cada estudiante, en un
  solo lugar"*, una línea de apoyo y tres píldoras translúcidas: `413 estudiantes`, `9 colegios`,
  `Callejón de Huaylas`.
- **Derecha:** tarjeta centrada `max-w-sm` con logo (azul) + `SICEDU`, H1 "Iniciar sesión",
  campos **Correo** y **Contraseña** (con botón ojo para mostrarla), enlace "¿Olvidó su
  contraseña?", botón primario a todo el ancho.
- Validación con zod: correo con formato válido, contraseña mínimo 8 caracteres. Errores de campo
  debajo del input.
- **401 del backend** → banner `danger` con el texto *"Correo o contraseña incorrectos"*. Nunca
  digas cuál de los dos falló.
- Éxito → guarda el token (memoria + `sessionStorage`), pide `/me` y redirige según rol:
  1 → `/inicio`, 2 → `/dashboard`, 3 → `/panel-ejecutivo`.
- Al pie, en texto pequeño: *"Conexión cifrada (TLS)"* y la mención a la Ley N.° 29733.

---

### P2 · Shell de la aplicación (layout común)
**Cubre: RNF-002, RNF-004, RNF-001**

- **Barra lateral** 248px, `bg-navy-900`, fija: logo blanco + `SICEDU`; items del menú según rol
  (icono lucide + etiqueta, activo con `bg-white/10` y barra izquierda `brand-500`); al pie, el
  usuario con su nombre, el nombre del rol y "Cerrar sesión".
- **Barra superior:** migas de pan (`Inicio › Registro de Vuelo › Histórico`), selector del
  **periodo de evaluación vigente**, `SyncBadge`, y el menú de usuario a la derecha.
- **Responsive (RNF-002):** de 360px a 1920px sin scroll horizontal. Bajo `lg` la barra lateral se
  vuelve un `Drawer` con botón hamburguesa; las tablas anchas van dentro de
  `overflow-x-auto` **dentro de la tarjeta**, nunca en el `body`.
- Si la cola offline tiene envíos pendientes, el `SyncBadge` los muestra y al hacer clic abre un
  panel con la lista y un botón "Reintentar ahora".

---

### P3 · Inicio del docente (`/inicio`) — rol 1
**Cubre: RF-004, RF-002, RN-001, RN-003, RN-006, RNF-006**

- Saludo con el nombre del docente y el periodo de evaluación vigente.
- Cuatro `StatCard`: *Mis estudiantes*, *Reporte de esta semana* (`registrados / total`),
  *Pendientes de rúbrica*, *Ajustes por revisar*.
- **Tarjeta "Mis asignaciones"**: una fila por colegio + grado asignado en el periodo vigente,
  con su avance semanal en barra y un botón "Registrar" que lleva al reporte semanal ya filtrado.
  Recuerda RN-003: un docente típicamente tiene **dos colegios** y en cada uno los **seis grados**.
- **Accesos rápidos** (3 tarjetas): Reporte semanal, Registro de vuelo, Nivel final.
- Aviso si el periodo tiene una evaluación diagnóstica abierta (abril / julio / octubre /
  diciembre) y aún no la ha registrado (RN-010).

---

### P4 · Reporte semanal (`/reporte-semanal`) — rol 1
**Cubre: RF-012, RF-013, RF-015, RF-016, RN-006, RN-007, RN-024, RNF-001, RNF-006**

La pantalla más usada. Es una **grilla de captura**, no un formulario por alumno: el docente abre
la semana y ve **todos sus alumnos precargados** en filas.

- `FilterBar`: Semana (selector con rango de fechas), Colegio, Grado. Por defecto, la semana en
  curso y la primera asignación del docente.
- Tabla con una fila por alumno y estas columnas:
  1. **Estudiante** (nombre + código del sistema en pequeño).
  2. **Asistencia** — interruptor sí/no. **Si es "no", el resto de la fila se deshabilita y se
     limpia** (así está modelado en la base de datos: sin asistencia no se pide nada más).
  3. **Libros de subir de nivel (LSB)** — botón "＋ Agregar libro" que abre un `Drawer` con una
     lista editable; cada libro tiene **título, aciertos y total** en campos separados (RF-015).
     Muestra el contador ("2 libros").
  4. **Sala de lectura (LSL)** — solo un número (RF-015: los LSL no llevan título ni puntaje).
  5. **Total** — calculado por el sistema, solo lectura (RF-016).
  6. **Observación** — textarea compacta, máximo 500 caracteres (RF-013).
- Columnas de referencia **solo lectura** a la izquierda, tomadas del último registro de vuelo:
  *Nivel esperado por Raz-Kids* y *Nivel colocado*. Van con fondo `surface-100` y un icono de
  candado; el docente no las llena (en el Excel actual solo estaban copiadas como guía).
- Pie de tabla: *"Cero libros es un valor válido en semanas sin actividad lectiva"* (RN-006).
- **Guardado:** botón primario "Guardar semana" + autoguardado por fila al salir del campo
  (debounce 800ms). Cada fila muestra su estado: guardando / guardado / pendiente de sincronizar.
- **RNF-001 (obligatorio):** el guardado va a una cola en IndexedDB con un `idempotency_key` por
  fila (`alumno-semana`). Si falla, **reintenta hasta 3 veces** con espera creciente
  (1s, 4s, 9s) y **no duplica** si el reintento sucede después de que el servidor ya lo aceptó.
  La interfaz nunca se bloquea por la red: el dato se muestra guardado localmente y el
  `SyncBadge` refleja la cola.
- **RNF-006:** esta pantalla existe para bajar de 2 horas a 1 el registro semanal. Nada de
  navegar por alumno: atajos de teclado `Tab` / `Enter` entre celdas, y botones "marcar toda la
  columna de asistencia" y "copiar la semana anterior".

---

### P5 · Rúbrica semanal (`/reporte-semanal`, pestaña "Rúbrica") — rol 1
**Cubre: RF-017, RF-025, RN-008, RN-016**

Segunda pestaña de la misma pantalla, con la misma grilla de alumnos.

- Por alumno, **dos selectores obligatorios**: *Fluidez Lectora* y *Comprensión Lectora*
  (RN-008: siempre las dos, nunca una sola). Si falta una, la fila se marca en `warning` y el
  guardado de esa fila se bloquea con el mensaje "Ambas dimensiones son obligatorias".
- Las opciones de cada selector **vienen del catálogo del backend filtrado por el programa del
  alumno**: en *Alfabetización*, Fluidez tiene 5 niveles (incluye **Pre Inicio**) y Comprensión 4;
  en *Comprensión Lectora*, 4 y 4. **No hardcodees los niveles** (RN-011): pídelos a
  `/niveles/rubrica?programa=`.
- Al costado de cada selector, un icono de información que muestra en `Tooltip` el descriptor
  oficial del nivel según el **ciclo evaluado** del alumno.
- **RF-025 / RN-016:** la rúbrica es un instrumento oficial de Misión Huascarán. En ninguna
  pantalla existe forma de crear, editar o borrar niveles o descriptores. Si el rol es 1, la
  sección de catálogos ni aparece.

---

### P6 · Registro de vuelo — histórico (`/registro-vuelo`) — rol 1 y 2
**Cubre: RF-011, RF-020, RF-021, RF-023, RF-024, RN-005, RN-010, RN-011, RN-014, RN-015**

Tabla comparativa de las cuatro evaluaciones diagnósticas del año, con edición en panel lateral.

- `FilterBar`: Colegio, Grado, Programa, Año, Periodo (Abril / Julio / Octubre / Diciembre),
  buscador de alumno, botón "Aplicar filtros".
- Columnas: **Alumno · Grado · Abril · Julio · Octubre · Diciembre · Últimos 3 · Tendencia ·
  Sugerencia · Estado · Acciones**.
  - Las celdas de cada periodo muestran el nivel Raz-Kids como `LevelChip` con la letra.
  - **Últimos 3**: la secuencia en texto (`D → D → C`).
  - **Tendencia**: `TrendIndicator` — Mejora / Estable / Baja / Incompleto.
  - **Sugerencia**: lo que el sistema propone (`Subir 1`, `Mantener`, `Bajar 1`, `Revisar`).
  - **Estado**: `Badge` — **Pendiente** (aún no confirmada), **Revisado** (confirmada por el
    docente), **Con error** (requiere revisión). Leyenda de los tres estados al pie de la tabla.
  - **Acciones**: editar (lápiz), ver trazabilidad (reloj), ver detalle (ojo).
- **Panel lateral "Editar evaluación"** (`Drawer`):
  - Encabezado con el alumno, grado y colegio.
  - Aviso destacado: *"Los históricos anteriores están bloqueados. Para corregirlos se requiere
    una justificación."* Los periodos ya cerrados se muestran con candado; solo el periodo vigente
    es editable (RN-010).
  - Campos: **Fluidez** y **Comprensión** (obligatorios), **Resultado** de la prueba
    (`aciertos / total`), **Nivel de la prueba tomada**, **Nivel inicial Raz-Kids** (solo lectura,
    prellenado con el nivel final del periodo anterior — RN-005), **Observación** (máx. 500).
  - **Bloque "Sugerencia (calculada)"** sobre fondo `success-100`: el nivel que propone el sistema
    y la acción ("Bajar 1 nivel"), con el texto *"Las sugerencias no son definitivas hasta que el
    docente confirme la evaluación"*.
  - Botones: Cancelar · **Guardar borrador** (secundario) · **Confirmar evaluación** (primario).
- **RF-021 / RN-011 / RN-014:** el nivel de Raz-Kids y el nivel criterial del docente son campos
  distintos y ambos se conservan. El del docente pesa más; el de Raz-Kids es referencial. Jamás
  uno sobreescribe al otro en la interfaz.
- **RF-023 / RN-015:** si el docente cambia el nivel sugerido, aparece un campo
  **Justificación obligatorio** y el botón de confirmar queda deshabilitado hasta que tenga texto.
- **RF-024:** el icono de reloj abre el `Modal` de trazabilidad (P8).

---

### P7 · Registrar evaluación diagnóstica (`/registro-vuelo/nuevo`) — rol 1
**Cubre: RF-020, RF-019, RF-022, RF-021, RNF-005, RN-004, RN-005, RN-009, RN-012, RN-013**

Formulario guiado con `Stepper` de 3 pasos: **1. Seleccionar estudiante · 2. Registrar evaluación
· 3. Revisar y guardar**. Dos columnas: formulario a la izquierda, panel de resultados a la
derecha.

- **Paso 1 — Datos del estudiante:** buscador; al elegirlo se autocompletan y **bloquean**
  (candado) ID, nombre, colegio, grado, programa y **ciclo evaluado** (RN-004: grado, ciclo y
  programa son datos separados). Nota al pie: *"Estos datos se completan automáticamente al
  seleccionar al estudiante"*.
- **Paso 2 — Evaluación:** selector del periodo (Abril/Julio/Octubre/Diciembre, RN-010), **nivel
  de la prueba tomada**, **aciertos / total** (control numérico), **nivel inicial Raz-Kids**
  marcado como `AUTOMÁTICO` y bloqueado (RN-005), **rúbrica de Fluidez** y **rúbrica de
  Comprensión** (obligatorias), y **Observaciones** con contador de 500.
- **Panel derecho "Resultados de la evaluación":**
  - Fila *Datos de entrada*: tres tarjetas — Nivel inicial, Prueba aplicada, Resultado.
  - Flecha hacia abajo con la leyenda *"El sistema evalúa los datos y las rúbricas"*.
  - Fila *Resultados calculados*: **Nivel sugerido** (letra Raz-Kids) y **Nivel final de rúbrica**
    (Inicio/Proceso/Logrado/Destacado), ambos con la etiqueta `CALCULADO AUTOMÁTICAMENTE`.
  - Nota: *"El nivel sugerido y el nivel final se calculan con la prueba, los aciertos y las
    rúbricas registradas"*.
  - **RNF-005: el cálculo debe mostrarse en menos de 3 segundos.** Recalcula en el cliente al
    cambiar cualquier insumo (sin esperar al servidor) y muestra `Skeleton` solo si tarda.
  - **RN-009 / RF-019:** el cálculo vive en **un solo archivo**, `src/domain/nivelFinal.js`,
    con firma `calcularNivelFinal({ nivelEntrada, aciertos, total, fluidez, comprension,
    programa, nivelEsperadoGrado })`. La fórmula definitiva **aún no está cerrada con el
    cliente**: implementa la regla provisional documentada abajo, marca el archivo con
    `// TODO RN-009: fórmula pendiente de validación con Patricia`, y **no repliques esa lógica en
    ningún componente**.
    - Regla provisional: `aciertos/total ≥ 0.8` → sube 1 nivel Raz-Kids; `≤ 0.4` → baja 1;
      en otro caso se mantiene.
    - **RN-013:** el nivel general es **Inicio** si la Fluidez es *Pre Inicio* o si el nivel
      alcanzado está por debajo del **nivel esperado para su grado**
      (`/niveles/esperado-por-grado`); en caso contrario, Proceso / Logrado / Destacado según
      corresponda.
    - **RN-012:** la escala Raz-Kids va de `aa` a `Z2`; compara por el campo `orden` del catálogo,
      nunca por la letra como texto.
- **Paso 3 — Revisar y guardar:** resumen de todo lo ingresado, franja verde *"Todos los campos
  obligatorios están completos"* y botones Cancelar · Guardar borrador · **Guardar evaluación**.

---

### P8 · Detalle y trazabilidad de una evaluación (`Modal`) — rol 1 y 2
**Cubre: RF-024, RN-014, RN-015**

Se abre desde el histórico. Es la pantalla que demuestra la revisión humana.

- Encabezado: alumno, periodo y `Badge` *"Modificado por docente"* si aplica.
- Fila de cinco tarjetas: Nivel anterior · Prueba aplicada · Resultado · Fluidez · Comprensión.
- **Bloque "Decisión y trazabilidad"**, en tres columnas:
  - **Sugerencia del sistema** (tarjeta `info`): el nivel propuesto y la razón.
  - Al centro, si difieren, una marca `danger` *"Diferencia detectada"* con una flecha.
  - **Decisión del docente** (tarjeta `warning`): el nivel final y la etiqueta "Cambio manual".
- **Observación del docente**: obligatoria cuando hay diferencia, con borde `warning` y contador.
- **Justificación del sistema** (fondo `info-100`): el texto que explica por qué sugirió ese nivel
  (ej. *"El sistema sugirió F al considerar 4/5, Fluidez en proceso y Comprensión lograda"*).
- **Línea de tiempo** horizontal con tres hitos coloreados: *Sistema sugirió X* → *Docente cambió
  a Y* → *Cambio guardado con observación*, cada uno con fecha, hora y autor. Al pie: "Última
  modificación: {docente} · {fecha}" y la leyenda de colores Sistema / Docente / Confirmado.

---

### P9 · Nivel final mensual (`/nivel-final`) — rol 1 y 2
**Cubre: RF-018, RF-019, RF-023, RF-024, RN-009, RN-014, RN-015, RNF-005**

- `FilterBar`: Mes, Colegio, Grado, Programa, Estado (Todos / Ajustados / Sin ajustar).
- Tabla: Alumno · Raz-Kids referencial · **Nivel calculado** · **Nivel final** · ¿Ajustado? ·
  Justificación (truncada) · Docente · Acciones.
- El consolidado mensual **se deriva de las rúbricas semanales** del mes (RF-018): muestra en una
  columna cuántos registros semanales lo sustentan (`4 de 4 semanas`) y advierte en `warning`
  cuando son menos de 3.
- Acción "Ajustar": `Drawer` con el nivel calculado bloqueado, un selector para el nivel final y
  **justificación obligatoria**. Al guardar, `Toast` de éxito y la fila pasa a "Ajustado".
- Para el rol 3 esta pantalla no existe.

---

### P10 · Estudiantes (`/estudiantes`) — los tres roles
**Cubre: RF-004, RF-007, RF-010, RF-002, RF-003, RN-001, RN-004, RN-019**

- `FilterBar`: buscador (nombre o código), Colegio, Grado, Aula, Programa, Estado.
- Tabla: Código · Estudiante · Colegio · Grado y ciclo · **Ciclo evaluado** · Programa ·
  Nivel actual · Última evaluación · Estado.
- El rol 1 ve por defecto solo sus asignaciones, con un interruptor **"Ver otros colegios (solo
  lectura)"** que activa RF-003 y muestra el aviso de modo consulta.
- Identificación por **código propio del sistema** (`EST-AMA-1042`), nunca por el N.° de lista del
  Excel.
- **RN-019 (Ley N.° 29733):** no muestres más datos personales que nombre, código y datos
  académicos. Sin fecha de nacimiento, sin DNI, sin dirección, sin fotos. Nada de datos de alumnos
  en la URL más allá del id interno.

---

### P11 · Ficha del estudiante (`/estudiantes/:id`) — los tres roles
**Cubre: RF-004, RF-011, RF-016, RF-021, RN-005, RN-014**

- Encabezado: nombre, código, colegio, grado, ciclo nominal vs. **ciclo evaluado**, programa
  vigente y `LevelChip` del nivel actual.
- Cuatro `StatCard`: nivel actual, variación frente al periodo anterior, libros del mes,
  asistencia del mes.
- **Gráfico de líneas — evolución entre evaluaciones diagnósticas** (RF-011): tres series —
  *nivel de la prueba*, *nivel ajustado por el docente* y *nivel esperado para su grado* (línea
  punteada de referencia). Eje Y con las letras del catálogo, no con números.
- **Gráfico de barras apiladas — rúbrica semanal del mes**: Fluidez y Comprensión, semana a
  semana.
- **Tabla de libros** (RF-016): por semana, LSB con título y puntaje, LSL solo cantidad, total
  calculado.
- **Tabla de historial de evaluaciones**: periodo, ciclo evaluado, prueba, Fluidez, Comprensión,
  nivel Raz-Kids, nivel final, si fue ajustado y la observación.
- Botón "Exportar ficha" (PDF) visible para roles 2 y 3.

---

### P12 · Dashboard consolidado (`/dashboard`) — rol 2
**Cubre: RF-005, RF-006, RF-007, RF-010, RN-002, RN-004, RNF-002**

**RF-006 es explícito: todo en una sola vista, con pestañas por colegio, filtros y tarjetas de
indicadores, sin navegar entre pantallas distintas.** Respétalo: no partas esto en varias rutas.

- `FilterBar` persistente arriba: Programa, Colegio, Grado, Aula, Estudiante, Periodo de
  evaluación, Dimensión (Fluidez / Comprensión). Los filtros se guardan en `zustand` y se
  reflejan en la URL como query params (`?programa=1&colegio=3`) para poder compartir la vista.
- `Tabs`: **Todos los colegios** + una pestaña por cada uno de los 9.
- Cuatro `StatCard`: Estudiantes en el programa · % en Logrado o Destacado · Cobertura del
  periodo · % que subió de nivel.
- Gráficos (todos con `recharts`, altura fija, leyenda abajo):
  1. **Distribución por nivel y periodo** — barras apiladas al 100% con los cuatro cortes del año.
  2. **Variación de nivel** — dona: se mantiene / sube 1 / sube 2 / sube 3 o más.
  3. **Nivel alcanzado vs. nivel esperado por grado** — barras comparadas (eje Y en letras).
  4. **Fluidez vs. Comprensión** — barras agrupadas, nunca un promedio de ambas.
  5. **Evolución del programa** — líneas por programa a lo largo de los cuatro periodos.
  6. **Cobertura del registro por colegio** — barras con meta al 100%.
- Tabla inferior de colegios: distribución en barra segmentada, % de logro, cobertura y enlace al
  detalle.
- Cada gráfico lleva un botón de descarga (PNG / CSV) y un `Tooltip` que explica qué mide.

---

### P13 · Colegios y ranking (`/colegios`) — roles 2 y 3
**Cubre: RF-008, RF-009, RF-007, RN-002, RN-004**

- `FilterBar`: Programa, Periodo, Dimensión, Zona (Yungay / Carhuaz).
- **Ranking de colegios (RF-009)**: podio con los tres primeros + lista ordenada con barra de
  progreso y porcentaje de logro. Marca los dos requerimientos como `NICE TO HAVE` en el
  comentario del archivo.
- **Dispersión logro vs. cobertura**: evita confundir "va mal" con "todavía no cargó datos".
- Tabla comparativa de los 9 colegios.
- **Detalle del colegio (`/colegios/:id`)**: indicadores del colegio, distribución por grado,
  evolución frente al promedio de los nueve, **ranking de aulas dentro del colegio (RF-008)** y
  tabla de grados con docente asignado y cobertura.

---

### P14 · Consolidados (`/consolidados`) — rol 2
**Cubre: RF-010, RF-016, RF-006**

Dos pestañas, cada una con filtros por colegio, grado, estudiante y periodo:

- **Consolidado de niveles**: conteo y porcentaje de alumnos por nivel, por grado y periodo,
  separado por programa (es el equivalente de la pestaña CONSOLIDADO del Excel).
- **Consolidado de libros**: totales de LSB y LSL por colegio, grado y mes, con total general.

Ambas con botón de exportación a Excel y CSV, y una nota que indique si el dato es un snapshot
del cierre del periodo o un cálculo en vivo.

---

### P15 · Alertas de inconsistencias (`/alertas`) — rol 2
**Cubre: RF-014, RN-006**

Lista de alertas (`NICE TO HAVE`) cuando el reporte semanal no cuadra con el consolidado mensual
de un estudiante: alumno, colegio, mes, valor semanal, valor consolidado, diferencia y acciones
"Ver detalle" / "Marcar como revisada". `EmptyState` amable cuando no hay ninguna.

---

### P16 · Administración (`/administracion`) — rol 2
**Cubre: RF-002, RF-025, RN-001, RN-003, RN-016**

Pestañas: **Docentes**, **Asignaciones**, **Periodos de evaluación**, **Catálogos**.

- *Asignaciones*: tabla docente × colegio × grado × periodo de evaluación, con alta y baja. Deja
  claro con un aviso que **la rotación ocurre solo al cierre de un periodo** y que implica cambiar
  el colegio completo, no grados sueltos (RN-003).
- *Catálogos*: niveles de Raz-Kids, niveles de rúbrica y nivel esperado por grado, **en modo
  lectura** con el aviso *"La rúbrica es un instrumento oficial de Misión Huascarán y no puede
  modificarse desde el sistema"* (RF-025 / RN-016).

---

### P17 · Panel ejecutivo (`/panel-ejecutivo`) — rol 3
**Cubre: RF-005, RF-009, RF-010, RN-002, RNF-004**

Vista de lectura, pensada para proyector: seis indicadores grandes (estudiantes atendidos, % en
Logrado o Destacado, avance frente al periodo anterior, colegios con datos al día, libros leídos
en el año, asistencia promedio), la evolución anual por programa, el ranking de colegios y un
bloque de descargas. **Sin un solo formulario de captura**: si el rol 3 llega por URL a una
pantalla de registro, va a `/403`.

---

### P18 · Error de permisos (`/403`) — pública
**Cubre: RNF-004**

`EmptyState` con candado, el texto *"No tiene permisos para acceder a esta sección"*, el rol con
el que se ingresó y un botón para volver al inicio de su rol.

---

## 7. Requisitos no funcionales — cómo se implementan

| ID | Requisito | Implementación exigida |
|---|---|---|
| **RNF-001** | Guardado con 70% de disponibilidad, hasta 3 reintentos sin duplicar | cola en IndexedDB (`idb-keyval`), `idempotency_key` por registro, backoff 1s/4s/9s, badge de sincronización, reintento manual |
| **RNF-002** | De 360px a 1920px, sin pérdida de funcionalidad ni scroll horizontal | mobile-first; tablas con `overflow-x-auto` dentro de la tarjeta; filtros en `Drawer` en móvil; verifica en 360, 768, 1280 y 1920 |
| **RNF-003** | Cifrado en tránsito (TLS 1.2+) y en reposo, Ley N.° 29733 | `VITE_API_BASE_URL` solo `https` en producción; token en memoria + `sessionStorage` (nunca `localStorage`); ningún dato de alumno en la URL ni en logs de consola; `Cache-Control: no-store` en respuestas sensibles |
| **RNF-004** | Bloquear el 100% de accesos cruzados entre roles | guardas de ruta reales + verificación de rol antes de cada mutación; ocultar el menú no es suficiente; test de vitest que recorre las rutas de cada rol |
| **RNF-005** | Nivel final calculado y mostrado en menos de 3 segundos | cálculo en el cliente con `useMemo` en `src/domain/nivelFinal.js`; no esperes al backend para pintar la sugerencia |
| **RNF-006** | Reducir a la mitad el tiempo de registro semanal (2h → 1h) | grilla con todos los alumnos precargados, autoguardado, navegación por teclado, "copiar semana anterior", acciones masivas de asistencia |

---

## 8. Estructura de carpetas

```
src/
├─ main.jsx
├─ App.jsx                    // router + providers
├─ assets/                    // logo_MH.svg, img_header_home.jpg
├─ api/                       // client, endpoints, mock, resources (ver §3)
├─ auth/
│  ├─ AuthProvider.jsx        // sesión, token, /me
│  ├─ ProtectedRoute.jsx
│  ├─ RoleRoute.jsx
│  └─ roles.js                // ROLES = { PROFESOR:1, JEFA:2, DIRECTIVOS:3 }
├─ components/
│  ├─ ui/                     // los componentes base de §4.5
│  ├─ layout/                 // AppShell, Sidebar, Topbar, Breadcrumbs
│  └─ charts/                 // un wrapper por gráfico, con tema común
├─ domain/
│  ├─ nivelFinal.js           // RN-009 / RF-019 / RN-013 — única fuente del cálculo
│  ├─ niveles.js              // comparación por `orden`, colores por nivel
│  └─ totales.js              // RF-016 — totales de libros
├─ features/
│  ├─ login/  inicio/  reporteSemanal/  rubricaSemanal/
│  ├─ registroVuelo/  nivelFinal/  estudiantes/
│  ├─ dashboard/  colegios/  consolidados/  alertas/
│  ├─ administracion/  panelEjecutivo/
├─ hooks/                     // useDebounce, useMediaQuery, useOfflineQueue
├─ store/                     // zustand: session, filtros, cola
├─ lib/                       // format.js (fechas, números), export.js (csv/png)
└─ styles/index.css
```

Convenciones: un componente por archivo, `PascalCase.jsx` para componentes y `camelCase.js` para
el resto; nada de componentes de más de 200 líneas (extrae subcomponentes); textos de interfaz en
español, **sin** librería de i18n.

---

## 9. Datos de prueba (modo mock)

Genera en `src/api/mock/db.js`, con **semilla fija** para que los gráficos no cambien entre
recargas:

- 9 colegios (zonas Yungay y Carhuaz), 6 grados, 3 ciclos, 2 programas.
- ~413 alumnos repartidos, con la mezcla real: la mayoría en Comprensión Lectora y algunos de
  grados altos todavía en Alfabetización.
- 3 docentes, cada uno con **2 colegios asignados** y sus 6 grados (RN-003), y un caso de rotación
  entre el periodo 1 y el 3.
- 4 evaluaciones diagnósticas por alumno (con cortes incompletos en octubre y diciembre, para que
  se vean los estados "Pendiente" e "Incompleto").
- 18 semanas de reporte semanal con asistencia, libros LSB y LSL.
- Rúbricas semanales coherentes con el programa de cada alumno.
- Niveles finales mensuales, algunos **ajustados por el docente con justificación**, para poder
  demostrar la trazabilidad de P8.
- Nombres de alumnos **ficticios**. Nada de datos reales.

Los catálogos del mock deben tener exactamente la forma del backend: `nivel_razkids`
(`letra`, `orden`), `nivel_rubrica` (`id_programa`, `dimension`, `orden`, `nombre_nivel` — 17
filas), `nivel_general` (4 filas) y `nivel_esperado_por_grado`.

---

## 10. Entregables

Al terminar debes haber producido, además del código:

1. **`STACK_FRONTEND.md`** en la raíz del repositorio, con:
   - tabla resumen del stack y la versión exacta instalada de cada dependencia;
   - justificación de cada elección (React, Vite, Tailwind, React Query, Recharts, zustand,
     idb-keyval), en el mismo tono técnico del documento de stack del backend;
   - cómo se consume la API de FastAPI y cómo funciona el modo mock;
   - cómo se cumple cada RNF (tabla de la §7);
   - **despliegue**: el servidor y el dominio los provee el curso; el frontend se construye con
     `npm run build` y se publica el contenido de `dist/` como sitio estático detrás del mismo
     dominio que el backend, con la API bajo `/api`. Incluye el `Dockerfile` de dos etapas
     (build con Node, servido con Nginx) y menciona la convención de repositorio del curso
     (`FRT-{NOMBRE-PROYECTO}`) y el flujo de ramas `development → qa → uat → main`;
   - instrucciones de instalación y variables de entorno.
2. **`README.md`**: qué es el proyecto, cómo levantarlo, scripts disponibles, estructura.
3. **`Dockerfile`** y **`nginx.conf`** listos para el pipeline de Jenkins del curso.
4. **`.env.example`**.
5. **`docs/trazabilidad-rf.md`**: tabla de dos columnas — cada RF/RNF y la ruta de la pantalla que
   lo cubre. Es la base con la que el equipo va a documentar las capturas.

---

## 11. Orden de implementación

Haz las fases en este orden y detente al final de cada una para que se pueda revisar:

1. **Fase 1 — Base:** proyecto Vite, Tailwind con los tokens, fuentes, assets, componentes `ui/`
   de §4.5 y una página de muestra que los exhiba (`/_ui`, solo en desarrollo).
2. **Fase 2 — Sesión:** login (P1), `AuthProvider`, guardas, `/403`, shell con barra lateral por
   rol (P2), modo mock funcionando.
3. **Fase 3 — Captura del docente:** inicio (P3), reporte semanal (P4), rúbrica semanal (P5), cola
   offline y `SyncBadge`.
4. **Fase 4 — Evaluación:** histórico del registro de vuelo (P6), formulario de 3 pasos (P7),
   trazabilidad (P8), `domain/nivelFinal.js`.
5. **Fase 5 — Estudiantes:** listado (P10) y ficha con gráficos (P11), nivel final mensual (P9).
6. **Fase 6 — Consolidados:** dashboard (P12), colegios y rankings (P13), consolidados (P14),
   alertas (P15).
7. **Fase 7 — Cierre:** administración (P16), panel ejecutivo (P17), exportaciones, tests de
   guardas y de cálculo, `STACK_FRONTEND.md`, `docs/trazabilidad-rf.md`, `Dockerfile`.

---

## 12. Definición de terminado

Una pantalla está lista cuando:

- [ ] tiene el comentario con los RF/RN que cubre en la primera línea del archivo;
- [ ] se ve correctamente en 360px, 768px y 1440px, sin scroll horizontal;
- [ ] tiene estados de carga (`Skeleton`), vacío (`EmptyState`) y error visibles;
- [ ] los formularios validan con zod y muestran el error junto al campo;
- [ ] no hay texto, color ni espaciado fuera de los tokens de §4;
- [ ] no hay `console.log` con datos de alumnos;
- [ ] funciona con `VITE_USE_MOCK=true` sin backend levantado;
- [ ] el rol equivocado recibe `/403` al entrar por URL.

---

## 13. Lo que está abierto (no lo inventes)

- **La fórmula exacta del nivel final / delta (RN-009)** no está cerrada con el cliente. Usa la
  regla provisional de §P7, aislada en `domain/nivelFinal.js` y marcada con `TODO`.
- **Si el nivel general debe tener un equivalente a "Pre Inicio"** está por confirmar; hoy
  "Pre Inicio" solo existe en Fluidez del programa de Alfabetización.
- **La importación de archivos Excel está fuera de alcance**: el registro es por formulario dentro
  de la plataforma. No construyas pantallas de carga de archivos, pero deja la capa de guardado
  desacoplada del origen del dato.
- **La ingesta directa desde Raz-Kids está descartada** por ahora (solo 3 tablas son exportables y
  los quizzes por lectura no lo son). Los datos de Raz-Kids se ingresan a mano (RF-020).
- **Las funcionalidades propias del rol Directivos** están "a definir" en el diseño: implementa el
  panel ejecutivo de P17 como propuesta y déjalo señalado en `docs/trazabilidad-rf.md`.
