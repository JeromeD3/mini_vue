import { h, ref } from '../../lib/guide-mini-vue.esm.js'
export const App = {
  name: 'App',
  render() {
    return h('div', { id: 'app', ...this.props }, [
      h('h1', {}, 'Hello Vue ' + this.count),
      h('button', { onClick: this.onClick }, 'add'),
      h('button', { onClick: this.onChangePropsDemo1 }, 'change props demo1'),
      h('button', { onClick: this.onChangePropsDemo2 }, 'change props demo2'),
      h('button', { onClick: this.onChangePropsDemo3 }, 'change props demo3')
    ])
  },
  setup() {
    const count = ref(0)
    const onClick = () => {
      count.value++
    }
    const props = ref({
      foo: 'foo',
      bar: 'bar'
    })

    const onChangePropsDemo1 = () => {
      props.value.foo = 'new-foo'
    }

    const onChangePropsDemo2 = () => {
      props.value.foo = undefined
    }

    const onChangePropsDemo3 = () => {
      props.value = {
        foo: 'foo'
      }
    }
    return {
      count,
      onClick,
      onChangePropsDemo1,
      onChangePropsDemo2,
      onChangePropsDemo3,
      props
    }
  }
}
