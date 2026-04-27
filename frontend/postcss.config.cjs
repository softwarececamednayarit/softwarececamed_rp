module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    'autoprefixer': {}, // <--- esta es la línea que soluciona los fallos de diseño en navegadores antiguos
  },
}