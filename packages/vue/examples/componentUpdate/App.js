import { h, ref } from '../../lib/guide-mini-vue.esm.js'
import Child from './Child.js'
export const App = {
  name: 'App',
  render() {
    return h('div', {}, [
      h('h1', {}, 'App'),
      h(
        'button',
        {
          onClick: this.changeChildProps
        },
        'changeChildProps'
      ),
      h('h2', {}, 'this.count: ' + this.count),
      h(Child, {
        msg: this.msg
      }),
      h(
        'button',
        {
          onClick: this.changeCount
        },
        'changeCount'
      )
    ])
  },
  setup() {
    const msg = ref('123')
    const count = ref(1)

    window.msg = msg

    const changeChildProps = () => {
      msg.value = '456'
    }

    const changeCount = () => [count.value++]
    return {
      msg,
      changeChildProps,
      changeCount,
      count
    }
  }
}
