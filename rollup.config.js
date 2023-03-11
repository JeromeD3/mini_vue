import esbuild from 'rollup-plugin-esbuild'
export default {
  input: './packages/index.ts',
  output: [
    // cjs
    {
      format: 'cjs',
      file: 'lib/guide-mini-vue.cjs.js'
    },
    // esm
    {
      format: 'es',
      file: 'lib/guide-mini-vue.esm.js'
    }
  ],
  plugins: [esbuild()]
}
