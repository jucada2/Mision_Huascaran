import { forwardRef, useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Field, { controlClases } from './Field'
import cn from '../../lib/cn'

const Input = forwardRef(function Input(
  { label, hint, error, required, id, className, type = 'text', iconLeft: IconLeft, ...props },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const [verClave, setVerClave] = useState(false)
  const esPassword = type === 'password'
  const tipoReal = esPassword && verClave ? 'text' : type

  return (
    <Field id={inputId} label={label} hint={hint} error={error} required={required} className={className}>
      <div className="relative">
        {IconLeft && (
          <IconLeft className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
        )}
        <input
          ref={ref}
          id={inputId}
          type={tipoReal}
          aria-invalid={Boolean(error) || undefined}
          className={cn(controlClases(error, 'h-10'), IconLeft && 'pl-9', esPassword && 'pr-10')}
          {...props}
        />
        {esPassword && (
          <button
            type="button"
            onClick={() => setVerClave((v) => !v)}
            aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-surface-100 hover:text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            {verClave ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </Field>
  )
})

export default Input
