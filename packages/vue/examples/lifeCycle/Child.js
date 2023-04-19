import {
  h,
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated
} from '../../dist/guide-mini-vue.esm.js'

export default {
  name: 'child',
  setup(props, { emit }) {
    const msg = props.msg
    onBeforeMount(() => {
      console.log('子组件,onBeforeMount')
    })

    onMounted(() => {
      console.log('子组件,onMounted')
      setTimeout(() => {
        msg.value = 'HelloWorld'
      }, 1000)
    })

    onBeforeUpdate(() => {
      console.log('子组件,onBeforeUpdate')
    })

    onUpdated(() => {
      console.log('子组件,onUpdated')
    })
    return {
      msg
    }
  },
  render(proxy) {
    return h('div', {}, [h('h2', {}, this.$props.msg)])
  }
}
