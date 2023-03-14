import { PublicInstanceProxyHandlers } from '../../reactivity/src/componentPublicInstance'

/**
 *
 * @param vnode
 * @returns component
 */
export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    // Used to store the data returned by the setup function
    // Conveniently access the return value of setup in the render function useing 'this'
    setupState: {}
  }
  return component
}

export function setupComponent(instance) {
  // initProps()
  // initSlots()

  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
  const Component = instance.vnode.type

  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)
  const { setup } = Component

  if (setup) {
    // function object
    const setupResult = setup()
    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance, setupResult: any) {
  if (typeof setupResult === 'object') {
    // state
    instance.setupState = setupResult
  }
  finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
  const Component = instance.type
  instance.render = Component.render
}
