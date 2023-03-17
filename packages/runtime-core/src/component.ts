import { PublicInstanceProxyHandlers } from '../../reactivity/src/componentPublicInstance'
import { initProps } from './componentProps'
import { shallowReadonly } from '../../reactivity/src/reactive'
import { emit } from './componentEmit'
import { initSlots } from './componentSlots'

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
    setupState: {},
    props: {},
    slots: {},
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
    // function object
    // setup里面的props是浅层的
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit
    })
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
