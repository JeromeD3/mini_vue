import { h, provide, inject } from '../../dist/guide-mini-vue.esm.js'
const Provider = {
  name: 'Provider',
  setup() {
    provide('name', '小明')
    provide('age', 18)
  },

  render() {
    return h('div', {}, [h('span', {}, 'Provider'), h(ProviderTwo)])
  }
}

const ProviderTwo = {
  name: 'ProviderTwo',
  setup() {
    provide('name', '小红')
    provide('age', 20)
    const foo = inject('name')
    // const baz = inject('agebbbb',"默认值")
    const baz = inject('agebbbb', () => '默认值')

    return {
      foo,
      baz
    }
  },

  render() {
    return h('div', {}, [
      h('span', {}, `ProviderTwo - ${this.foo} - ${this.baz}`),
      h(Consumer)
    ])
  }
}

const Consumer = {
  name: 'Consumer',
  setup() {
    const foo = inject('name')
    const bar = inject('age')

    return {
      foo,
      bar
    }
  },

  render() {
    return h('div', {}, [
      h('span', {}, 'Consumer'),
      h('p', {}, this.foo + this.bar)
    ])
  }
}

export default {
  name: 'App',
  render() {
    return h('div', {}, [h(Provider)])
  },
  //返回的时候不能少了setup，否则render不会执行
  setup() {}
}
