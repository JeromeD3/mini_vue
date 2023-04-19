import {
  h,
  createTextVNode,
  getCurrentInstance
} from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'
export const App = {
  name: 'App',
  setup() {
    const currentInstance = getCurrentInstance()
    console.log(currentInstance)
    return {
      msg: 'Hello World'
    }
  },

  render() {
    const app = h('div', { class: 'app' }, this.msg)
    // <Foo><p>123</p></Foo>
    const foo = h(
      Foo,
      {},

      //单值标签 -> 失效
      // h("p", {}, "外部传来的")

      // 多值标签 -> 失效，
      // [h('p', {}, '外部传来的123'), h('p', {}, '外部传来的456')]

      // 指定插槽 + 作用域插槽

      {
        default: () => h('p', {}, '外部传来的default'),
        header: ({ age }) => [
          h('p', {}, 'header' + '  ' + age),
          createTextVNode('你好啊👋')
        ],
        footer: () => h('p', {}, 'footer')
      }
    )
    return h('div', {}, [h('span', { class: 'aa' }, [app, foo])])
  }
}
