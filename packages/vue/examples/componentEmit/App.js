import { h } from '../../lib/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'
export const App = {
  setup() {
    return {
      msg: 'Hello World'
    }
  },

  render() {
    return h('div', {}, [
      h('h1', { class: 'aa' }, [
        h('span', {}, 'APP'),
        h(
          Foo,
          {
            onAdd(a, b) {
              console.log(a, b)
            },
            onAddFoo(a, b) {
              console.log('onAddFoo', a, b)
            }
          },
          'a'
        )
      ])
    ])
  }
}
