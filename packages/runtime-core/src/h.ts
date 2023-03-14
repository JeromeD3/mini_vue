import { createVNode } from './vnode'

// Create a virtual node with the description of the node 
// description: label name, other self information of the label, child element
/**
 * 
 * @param type 
 * @param props 
 * @param children 
 * @returns vnode
 */
export function h(type, props?, children?) {
  return createVNode(type, props, children)
}
