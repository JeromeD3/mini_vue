import { ShapeFlags } from '../../shared/src/ShapeFlags'
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
    shapeFlags: getShapeFlag(type),
    el: null
  }

  // console.log(vnode)
  // chilren
  if (typeof children === 'string') {
    vnode.shapeFlags |= ShapeFlags.TEXT_CHILDREN
  } else if (Array.isArray(children)) {
    vnode.shapeFlags |= ShapeFlags.ARRAY_CHILDREN
  }

  return vnode
}

function getShapeFlag(type) {
  // 根组件的shapeFlags
  return typeof type === 'string'
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT
}
