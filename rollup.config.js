import typescript from '@rollup/plugin-typescript'
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
      name: 'vue',
      format: 'es',
      file: 'packages/vue/dist/guide-mini-vue.esm.js'
    }
  ],
  plugins: [typescript()]
}
