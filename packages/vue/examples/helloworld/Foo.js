import { h } from '../../dist/guide-mini-vue.esm.js'
export const Foo = {
  setup() {},
  render() {
    const foo = h('p', {}, 'foo')
    // props不可修改
    console.log(this.$slots)
    return h('div', { class: 'foo' },)
  }
}
