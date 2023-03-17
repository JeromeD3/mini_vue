import { createVNode } from '../src/vnode'
export function renderSlots(slots: Array<any>, name, props = {}) {
  const slot = slots[name]
  if (slot) {
    // function ，用户自定义插槽，传值的情况
    const slotContent = slot(props)
    return createVNode('div', {}, slotContent)
  }
}
