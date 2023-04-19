import { h, ref } from '../../lib/guide-mini-vue.esm.js'
const prevChildren = 'old'
const nextChildren = 'new'

export default {
  name: 'TextToText',
  setup() {
    const isChange = ref(false)
    window.isChange = isChange

    return {
      isChange
    }
  },
  render() {
    const self = this
    return self.isChange === true
      ? h('div', {}, nextChildren)
      : h('div', {}, prevChildren)
  }
}
