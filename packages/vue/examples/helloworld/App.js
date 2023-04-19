import { h } from '../../dist/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'
window.self = null
export const App = {
  render() {
    window.self = this
    /**
     * type, props(vnode), children
     */
    return h(
      'div',
      {
        id: 'app2',
        class: ['red', 'hard'],
        onClick() {
          console.log('click')
        },
        onMousedown() {
          console.log('mousedown')
        }
      },
      // string
      // 'hi, hell world',
      // 'hi2, hell world'

      // setupState
      // 'hi2222,' + this.msg,

      // this.$el -> get root element

      //Array
      // [
      //   (h('h1', { class: 'red' }, 'Hello World'),
      //   h('p', { class: 'blue' }, 'This is a paragraph'))
      // ]

      [h('h1', { class: 'red' }, 'Hello World'), h(Foo, { count: 1 })]
    )
  },
  setup() {
    return {
      msg: 'Hello World'
    }
  }
}
