import { h } from '../../lib/guide-mini-vue.esm.js'

export const Foo = {
  setup(props, { emit }) {
    // 父组件可以使用props 把数据(函数)传给子组件，子组件可以通过emit触发父组件的事件
    const emitAdd = () => {
      console.log('emitAdd执行')
      emit('add', 1, 2)
      emit('add-foo', 1, 2)
    }
    return {
      emitAdd
    }
  },
  render() {
    // this 能访问到props的值
    // props不可修改
    const btn = h(
      'button',
      {
        onClick: this.emitAdd
      },
      'emitAdd'
    )

    const foo = h('p', {}, 'foo')
    return h('h2', { class: 'foo' }, [btn, foo])
  }
}
