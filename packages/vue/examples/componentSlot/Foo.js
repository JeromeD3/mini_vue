import {
  h,
  renderSlots,
  getCurrentInstance
} from '../../lib/guide-mini-vue.esm.js'
export const Foo = {
  name: 'Foo',
  setup() {
    const currentInstance = getCurrentInstance()
    console.log(currentInstance)
  },
  render() {
    const foo = h('p', {}, 'foo ')

    // 具名插槽
    // 1. 获取到要渲染的元素
    // 2. 要获取到渲染的位置
    // 3. 作用域插槽
    console.log('this.$slots', this.$slots)
    // this.$slots 父级传过来的vnode
    const age = 19 //作用域插槽
    return h('div', { class: 'foo' }, [
      // 渲染单值 -> 失效 直接用renderSlots
      // this.$slots

      // 渲染数组 多值直接渲染 -> 失效
      // renderSlots如何渲染单值呢？ 这就是initSlots的作用 判断他是否为数组，否则包裹为数组
      // renderSlots(this.$slots),

      // 具名插槽 -> 直接存在上面两种情况
      // vue3中的代码是有传过来的key是有defalut的情况的，
      // 所以说传过来的是数组之类的已经不处理了
      renderSlots(this.$slots, 'default'),
      renderSlots(this.$slots, 'header', { age }),
      foo,
      renderSlots(this.$slots, 'footer')
    ])
  }
}
