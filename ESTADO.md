# Estado del frontend SICEDU

> Última actualización: 17/09/2026. Documento de avance del equipo: qué está
> construido, qué falta y qué decisiones quedan abiertas. El plan completo está
> en `PROMPT_FRONTEND_SICEDU.md`; aquí solo se registra dónde quedó el trabajo.

## Resumen

| Fase | Alcance | Estado |
|---|---|---|
| **Fase 1** | Proyecto Vite, tokens de Tailwind, fuentes, assets, componentes `ui/`, catálogo visual `/_ui` | **Terminada** |
| **Fase 2** | Login (P1), `AuthProvider`, guardas de ruta, `/403` (P18), shell por rol (P2), modo mock | **Terminada** |
| **Fase 3** | Inicio del docente (P3), reporte semanal (P4), rúbrica semanal (P5), cola offline y `SyncBadge` | **Terminada, sin revisión visual** |
| Fase 4 | Registro de vuelo: histórico (P6), formulario de 3 pasos (P7), trazabilidad (P8), `domain/nivelFinal.js` | Pendiente |
| Fase 5 | Estudiantes (P10), ficha (P11), nivel final mensual (P9) | Pendiente |
| Fase 6 | Dashboard (P12), colegios y ranking (P13), consolidados (P14), alertas (P15) | Pendiente |
| Fase 7 | Administración (P16), panel ejecutivo (P17), exportaciones, `STACK_FRONTEND.md`, `docs/trazabilidad-rf.md`, `Dockerfile` | Pendiente |

Verificación a la fecha: `npm run lint` sin hallazgos, `npm run test` con **89 pruebas en verde**
y `npm run build` correcto.

## Qué se puede mostrar hoy

```bash
npm install
npm run dev          # http://localhost:5173
```

Con `VITE_USE_MOCK=true` (el valor por defecto de `.env.example`) la aplicación funciona
**sin backend levantado**.

### 1. Inicio de sesión por tipo de cuenta (P1 · RF-001)

Los tres roles del catálogo `rol` entran con contraseña `sicedu123`, y cada uno aterriza
donde le corresponde:

| Correo | Rol | Aterriza en |
|---|---|---|
| `rcardenas@sicedu.test` | Profesor (1) | `/inicio` — panel del docente, ya construido |
| `jefatura@sicedu.test` | Jefa_Profesores (2) | `/dashboard` — pantalla marcador, se construye en la Fase 6 |
| `direccion@sicedu.test` | Directivos (3) | `/panel-ejecutivo` — pantalla marcador, Fase 7 |

La pantalla de login lista esos tres usuarios con un botón "Usar" **solo en modo mock**; con la
API real ese bloque no se renderiza.

Lo que ya cumple el login: validación con zod, error único *"Correo o contraseña incorrectos"*
ante un 401 (nunca dice cuál de los dos campos falló), token en memoria con respaldo en
`sessionStorage` y nunca en `localStorage` (RNF-003), y mención a la Ley N.° 29733.

### 2. Guardas de rol (RNF-004)

Las 16 rutas de §5 existen con su guarda definitiva. Un rol que escribe a mano una URL ajena
termina en `/403`, no solo deja de ver el enlace en el menú. Hay un test que recorre las
16 rutas con los tres roles (48 combinaciones).

### 3. Panel del docente (P3 · `/inicio`)

Saludo con periodo vigente, los cuatro indicadores, el aviso de corte diagnóstico abierto
(RN-010), la tarjeta "Mis asignaciones" —dos colegios con sus seis grados, con avance semanal y
acceso directo a la grilla ya filtrada— y los tres accesos rápidos.

### 4. Captura semanal (P4 y P5 · `/reporte-semanal`)

Dos pestañas sobre la misma grilla de alumnos: **Reporte semanal** (asistencia, libros LSB con
título/aciertos/total en campos separados, sala de lectura, total calculado y observación de 500
caracteres) y **Rúbrica** (Fluidez y Comprensión, con las opciones traídas del catálogo según el
programa del alumno y el descriptor del ciclo en un tooltip).

Incluye lo que exige RNF-006: autoguardado por fila a los 800 ms, navegación con Enter entre
celdas, "marcar toda la asistencia" y "copiar la semana anterior".

### 5. Cola de envíos offline (RNF-001)

`src/lib/colaOffline.js` guarda cada fila pendiente en IndexedDB con su `idempotency_key`
(`alumno-semana`), reintenta hasta tres veces con esperas de 1 s, 4 s y 9 s, y no duplica: dos
ediciones de la misma fila reemplazan el pendiente en lugar de encolar otro, y un reintento que
llega después de que el servidor ya aceptó se resuelve como el mismo registro. El `SyncBadge` de
la barra superior muestra el estado y abre el panel con "Reintentar ahora".

## Pendiente de la Fase 3

- **Revisión visual en 360 px, 768 px y 1440 px.** El código respeta RNF-002 (tablas con su
  propio `overflow-x-auto`, filtros que colapsan en Drawer), pero nadie lo ha visto en pantalla
  todavía. Es el único punto de la §12 que queda sin verificar.
- **Tests de la cola offline.** Están cubiertos el cálculo de totales, los handlers del mock y
  las guardas; falta un test que simule el fallo de red y verifique los tres reintentos.

## Decisiones tomadas que conviene revisar

- **Endpoints propuestos por el frontend.** `GET /docentes/{id}/asignaciones` y
  `GET /docentes/{id}/resumen` no están en §3: los necesita el panel del docente y hay que
  contrastarlos con el equipo de backend.
- **Libros dentro de la fila.** El contrato declara `POST /reporte-semanal/{id}/libros` y
  `DELETE /reporte-semanal/libros/{id}`, pero la pantalla guarda la fila completa con sus libros
  dentro: es lo que permite reintentar un envío sin quedar a medio guardar. Las rutas siguen
  declaradas en `endpoints.js` por si el backend exige lo contrario.
- **"Ajustes por revisar"** (indicador de P3) se cuenta como las evaluaciones del periodo vigente
  cuya sugerencia el docente aún no confirma. El documento nombra el indicador pero no lo define.

## Lo que sigue sin definir (§13, no inventar)

- La fórmula del nivel final / delta (RN-009). Llega en la Fase 4, aislada en
  `src/domain/nivelFinal.js`.
- El nivel esperado por grado y los descriptores oficiales de la rúbrica: los valores del mock
  son provisionales y están marcados con `TODO` en `src/api/mock/db.js`.
- Si el nivel general necesita un equivalente a "Pre Inicio".
- Recuperación de contraseña: el backend todavía no expone el endpoint.

## Nota sobre el repositorio

El trabajo está en `main` del fork `github.com/jucada2/Mision_Huascaran`. El repositorio del
equipo (`AntonioCot7/Mision_Huascaran`) está en la Fase 1 y requiere permisos o un Pull Request
para recibir estos cambios. Según `instructions.md` §2, de aquí en adelante corresponde trabajar
con las ramas `development → qa → uat → main` y no hacer push directo a `main`.
