import '@testing-library/jest-dom/vitest'

// jsdom no implementa matchMedia y los componentes responsivos (FilterBar, la
// barra lateral) lo consultan al montarse. Se declara aquí como "escritorio".
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })
}
