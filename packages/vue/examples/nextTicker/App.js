import {
  getCurrentInstance,
  h,
  ref,
  nextTick
} from '../../dist/guide-mini-vue.esm.js'
export default {
  name: 'App',

  setup() {
    const instance = getCurrentInstance()
    const count = ref(1)
    function onClick() {
      for (let i = 0; i < 100; i++) {
        count.value = i
      }
    }
    nextTick(() => {
      console.log(instance.setupState)
    })

    // 如何实现顶层await？
    // await nextTick()
    // console.log(instance)
    return {
      count,
      onClick
    }
  },
  render() {
    const button = h('button', { onClick: this.onClick }, 'update')
    const p = h('p', {}, 'count:' + this.count)
    return h('div', {}, [button, p])
  }
}
