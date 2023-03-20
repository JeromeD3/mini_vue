import { PublicInstanceProxyHandlers } from '../../reactivity/src/componentPublicInstance'
import { initProps } from './componentProps'
import { shallowReadonly } from '../../reactivity/src/reactive'
import { emit } from './componentEmit'
import { initSlots } from './componentSlots'
import { proxyRefs } from '../../reactivity/src'

/**
 *
 * @param vnode
 * @returns component
 */
export function createComponentInstance(vnode, parent) {
  const component = {
    vnode,
    type: vnode.type,
    // Used to store the data returned by the setup function
    // Conveniently access the return value of setup in the render function useing 'this'
    setupState: {},
    props: {},
    slots: {},
    provides: parent ? parent.provides : {},
    parent,
    isMounted: false,
    subTree: {},
    emit: () => {}
  }
  component.emit = emit.bind(null, component) as any
  return component
}

export function setupComponent(instance) {
  initProps(instance, instance.vnode.props)
  initSlots(instance, instance.vnode.children)
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
  const Component = instance.vnode.type

  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)
  const { setup } = Component

  if (setup) {
    setCurrentInstance(instance)
    // function object
    // setup里面的props是浅层的
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit
    })

    setCurrentInstance(null)

    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance, setupResult: any) {
  if (typeof setupResult === 'object') {
    // state
    instance.setupState = proxyRefs(setupResult)
  }
  finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
  const Component = instance.type
  instance.render = Component.render
}

let currentInstance = null

export function getCurrentInstance() {
  return currentInstance
}

function setCurrentInstance(instance) {
  currentInstance = instance
}
