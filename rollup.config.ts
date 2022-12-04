import typescript from '@rollup/plugin-typescript'
import sourceMaps from 'rollup-plugin-sourcemaps'

const pkg = require('./package.json')
const libraryName = 'medialoaded'

export default {
  external: [],
  input: `build/es/index.js`,
  output: [
    { file: pkg.main, name: libraryName, format: 'umd', sourcemap: true },
    { file: pkg.module, format: 'es', sourcemap: true },
  ],
  plugins: [
    typescript(),
    // Resolve source maps to the original source
    sourceMaps(),
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  watch: {
    include: 'build/es/**',
  },
}
