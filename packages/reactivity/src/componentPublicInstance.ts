import { hasOwn } from '../../shared/src/index'
// import { hasOwn } from "@jerome778/shared"

const publicPropertiesMap = {
  $el: i => i.vnode.el
}
export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { setupState, props } = instance
    // 用object.has key 试一下
    if (key in setupState) {
      return setupState[key]
    }

    if (hasOwn(setupState, key)) {
      return setupState[key]
    } else if (hasOwn(props, key)) {
      return props[key]
    }

    // 当我们调用this的时候，会走到这里
    // key -> $el
    const publicGetter = publicPropertiesMap[key]
    if (publicGetter) {
      return publicGetter(instance)
    }
  }
}
