export { nextTick } from './scheduler'
export { createRenderer } from './renderer'
export { renderSlots } from '../helpers/renderSlots'
export { h } from './h'
export { createTextVNode, createElementVNode } from './vnode'
export { getCurrentInstance, registerRuntimeCompiler } from './component'
export { provide, inject } from './apiInject'
export { toDisplayString } from '@jerome778/shared'
export * from '@jerome778/reactivity'

export {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated
} from './apiLifecycle'
