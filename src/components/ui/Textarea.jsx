import { forwardRef, useId } from 'react'
import Field, { controlClases } from './Field'
import cn from '../../lib/cn'

/** Textarea con contador de caracteres ("41/500"). */
const Textarea = forwardRef(function Textarea(
  { label, hint, error, required, id, className, maxLength = 500, value, rows = 3, ...props },
  ref,
) {
  const generatedId = useId()
  const areaId = id ?? generatedId
  const usados = typeof value === 'string' ? value.length : undefined

  return (
    <Field
      id={areaId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
      counter={maxLength ? `${usados ?? 0}/${maxLength}` : undefined}
    >
      <textarea
        ref={ref}
        id={areaId}
        rows={rows}
        maxLength={maxLength}
        value={value}
        aria-invalid={Boolean(error) || undefined}
        className={cn(controlClases(error, 'resize-y py-2 leading-relaxed'))}
        {...props}
      />
    </Field>
  )
})

export default Textarea
