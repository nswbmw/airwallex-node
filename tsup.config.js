import { defineConfig } from 'tsup'

export default defineConfig([
  // ESM build
  {
    entry: ['src/**'],
    format: 'esm',
    dts: false,
    splitting: false,
    sourcemap: false,
    clean: true,
    minify: false,
    bundle: false,
    outDir: 'dist/esm',
    target: 'es2020',
    esbuildOptions (options) {
      options.drop = ['debugger']
      options.legalComments = 'none'
    }
  },
  // CJS build
  {
    entry: ['src/**'],
    format: 'cjs',
    dts: false,
    splitting: false,
    sourcemap: false,
    clean: true,
    minify: false,
    bundle: false,
    outDir: 'dist/cjs',
    target: 'es2020',
    outExtension () {
      return { js: '.cjs' }
    },
    esbuildOptions (options) {
      options.drop = ['debugger']
      options.legalComments = 'none'
    }
  }
])
