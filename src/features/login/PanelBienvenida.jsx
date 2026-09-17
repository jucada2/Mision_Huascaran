import imagenPortada from '../../assets/img_header_home.jpg'
import Logo from '../../components/ui/Logo'

/**
 * Columna izquierda del login (P1, §4.4).
 * La fotografía se usa aquí y en ninguna otra pantalla.
 */
const PILDORAS = ['413 estudiantes', '9 colegios', 'Callejón de Huaylas']

export default function PanelBienvenida() {
  return (
    <div className="relative hidden lg:block">
      <img
        src={imagenPortada}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-[52%_30%]"
      />
      {/* Velo azul marino: sin él el texto blanco no se lee sobre la foto. */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-navy-900/85 via-navy-900/10 to-navy-900/50"
        aria-hidden="true"
      />

      <div className="relative flex h-full flex-col justify-between p-10 text-white">
        <Logo tone="light" size="md" />

        <div>
          <h2 className="max-w-md font-display text-3xl font-bold leading-tight text-white">
            El avance lector de cada estudiante, en un solo lugar
          </h2>
          <p className="mt-3 max-w-md text-sm text-white/80">
            Registro semanal, evaluaciones diagnósticas y niveles finales del programa de Educación,
            sin planillas sueltas de Excel.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {PILDORAS.map((texto) => (
              <li
                key={texto}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm"
              >
                {texto}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
