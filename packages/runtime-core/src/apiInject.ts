import { getCurrentInstance } from './component'

// 这两个api只能在setup函数中使用
// 因为这里需要获取当前组件实例，而组件实例是在setup函数中创建的
export function provide(key, value) {
  // 返回当前this
  const currentInstance: any = getCurrentInstance()
  if (currentInstance) {
    let { provides } = currentInstance
    // 当前组件的provides对象等于父组件的provides对象
    const parentProvides = currentInstance.parent.provides

    // 创建一个新的provides对象，这样就不会影响到父组件的provides,且原型链指向父级
    // 这里的if操作是为了避免重复创建provides对象，如果同一个setup有第二个provide，那么会重复创建provides对象，把之前的给覆盖掉
    if (provides === parentProvides) {
      // 为了避免在根组件中provide的值被修改， 因为当前组件的provides对象是父组件的provides对象的引用
      // 当前组件如果存了一个跟父组件一样的key，那么父组件的provides对象也会被修改
      // 所以，这里使用Object.create创建一个新的对象
      // 没有自己的值的话，会沿着原型链找父级的

      // 为什么这两个都要赋值，因为currentInstance是引用
      provides = currentInstance.provides = Object.create(parentProvides)
    }
    provides[key] = value
  }
}

export function inject(key, defaultValue) {
  const currentInstance: any = getCurrentInstance()
  if (currentInstance) {
    const parentProvides = currentInstance.parent.provides
    if (parentProvides.hasOwnProperty(key)) {
      return parentProvides[key]
    } else if (defaultValue) {
      return defaultValue
    } else if (typeof defaultValue === 'function') {
      return defaultValue()
    }
  }
}
