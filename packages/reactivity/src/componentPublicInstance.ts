const publicPropertiesMap = {
  $el: i => i.vnode.el
}
export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { setupState } = instance
    // 用object.has key 试一下
    if (key in setupState) {
      return setupState[key]
    }

    // 当我们调用this的时候，会走到这里
    // key -> $el
    const publicGetter = publicPropertiesMap[key]
    if (publicGetter) {
      return publicGetter(instance)
    }
  }
}
