import {
  h,
  ref,
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated
} from '../../dist/guide-mini-vue.esm.js'

export const App = {
  render() {
    window.self = this
    return h(
      'div',
      {
        id: 'root',
        class: ['pages']
      },
      [h('h1', null, 'LifeCycle'), h('h4', null, this.msg)]
    )
  },
  setup() {
    const msg = ref('1')

    onBeforeMount(() => {
      console.log('onBeforeMount')
    })

    onMounted(() => {
      console.log('onMounted')
      console.log('msg.value', msg.value)

      setTimeout(() => {
        msg.value = 'HelloWorld'
      }, 1000)
    })

    onBeforeUpdate(() => {
      console.log('onBeforeUpdate')
    })

    onUpdated(() => {
      console.log('onUpdated')
    })

    return {
      msg
    }
  }
}
