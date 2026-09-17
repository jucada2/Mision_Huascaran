// Concatenador de clases de Tailwind. Ignora valores falsy para poder escribir
// condicionales inline sin plantillas ilegibles.
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default cn
