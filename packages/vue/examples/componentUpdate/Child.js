import { h } from '../../lib/guide-mini-vue.esm.js'

export default {
  name: 'child',
  setup(props, { emit }) {
    const msg = props.msg
    return {
      msg
    }
  },
  render(proxy) {
    return h('div', {}, [h('h2', {}, this.$props.msg)])
  }
}
