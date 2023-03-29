import { ShapeFlags } from '../../shared/src/ShapeFlags'

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')

export { createVNode as createElementVNode }
/**
 *
 * @param type
 * @param props
 * @param children
 * @returns vnode
 */
export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    component: null,
    shapeFlags: getShapeFlag(type),
    el: null,
    key: props && props.key
  }

  // chilren
  if (typeof children === 'string') {
    vnode.shapeFlags |= ShapeFlags.TEXT_CHILDREN
  } else if (Array.isArray(children)) {
    vnode.shapeFlags |= ShapeFlags.ARRAY_CHILDREN
  }

  // 判断是不是需要slot
  // 组件 + children obj
  if (vnode.shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
    if (typeof children === 'object') {
      vnode.shapeFlags |= ShapeFlags.SLOT_CHILDREN
    }
  }

  return vnode
}

export function createTextVNode(text: string) {
  return createVNode(Text, {}, text)
}

function getShapeFlag(type) {
  // 根组件的shapeFlags
  return typeof type === 'string'
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT
}
