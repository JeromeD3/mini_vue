import { ShapeFlags } from '../../shared/src/ShapeFlags'
export function initSlots(instance, children) {
  const { vnode } = instance

  // 判断是否有插槽，否则不进行处理，减少性能消耗
  if (vnode.shapeFlags & ShapeFlags.SLOT_CHILDREN) {
    // 为什么只考虑对象了呢？ 而不用考虑之前的多值插槽数组？
    normalizeObjectSlots(children, instance.slots)
  }
}

function normalizeObjectSlots(children: any, slots: any) {
  for (const key in children) {
    if (Object.prototype.hasOwnProperty.call(children, key)) {
      const value = children[key]
      // 为什么需要判断是否是数组？
      // 因为插槽有单值和多值两种情况
      // 为了统一，将单值插槽转换为数组
      // 而且renderSlot中的createVNode那里接受的是数组或者字符串，
      // 所以单值的话统一包装成数组来处理
      // 那为什么在Foo.js中children可以传obj呢？和单值的原理一样
      // 因为在渲染的过程中会触发initSlots，这个时候会将obj转换为数组

      // 这里主要做的操作是将h函数传过来的函数进行了处理,返回vnode，作用域插槽的时候会用到
      // 到时调用this.$slots的时候就会返回对应的vnode
      
      slots[key] = props => {
        return normalizeSlotValue(value(props))
      }
    }
  }
}

/**
 *
 * @param value slots（vnode）
 * @return 【vnode】
 */
function normalizeSlotValue(value) {
  // console.log('value', value)
  return Array.isArray(value) ? value : [value]
}
