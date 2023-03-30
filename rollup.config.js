import esbuild from 'rollup-plugin-esbuild'
export default {
  input: './packages/vue/src/index.ts',
  output: [
    // cjs
    {
      format: 'cjs',
      file: 'packages/vue/dist/guide-mini-vue.cjs.js'
    },
    // esm
    {
      format: 'es',
      file: 'packages/vue/dist/guide-mini-vue.esm.js'
    }
  ],
  plugins: [esbuild()]
}
