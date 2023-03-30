import { createComponentInstance, setupComponent } from './component'
import { createAppAPI } from './createApp'
import { Fragment, Text } from './vnode'
import { shouldUpdateComponent } from './componentUpdateUtils'
import { queueJobs } from './shcheduler'
import { EMPTY_OBJ, ShapeFlags } from '@jerome778/shared'
import { effect } from '@jerome778/reactivity'

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    setElementText: hostSetElementText,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove
    // setText: hostSetText,
    // createText: hostCreateText
  } = options

  function render(vnode, container) {
    // 这里只会执行一次，因为是根节点，所以没有父节点，so，下面的父节点给了null
    // patch
    patch(null, vnode, container, null, null)
  }

  // n1->oldVnode
  // n2->newVnode
  function patch(n1, n2, container, parentComponent, anchor) {
    // 1. 判断新旧vnode是否是同一个对象
    // 2. 如果是同一个对象，那么就是更新操作
    // 3. 如果不是同一个对象，那么就是替换操作

    // ShapeFlags -> 标识 vnode 有哪几种 flag
    const { shapeFlags, type } = n2

    //Fragement -> 只渲染children

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlags & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor)
        } else if (shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent, anchor)
        }
        break
    }
  }

  function processText(n1, n2, container) {
    // Text类型的vnode，children就是文本内容，跳过渲染mountElement，直接渲染文本节点
    const { children } = n2
    const textNode = (n2.el = document.createTextNode(children))
    container.append(textNode)
  }

  function processFragment(n1, n2, container, parentComponent, anchor) {
    mountChildren(n2.children, container, parentComponent, anchor)
  }

  function processElement(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      // init
      mountElement(n2, container, parentComponent, anchor)
    } else {
      // update
      patchElement(n1, n2, container, parentComponent, anchor)
    }
  }

  /**
   * 用于更新element
   * @param n1
   * @param n2
   * @param container
   * @param parentComponent
   * @param anchor
   */
  function patchElement(n1, n2, container, parentComponent, anchor) {
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ
    // 为什么n2这里需要赋值？ 因为一开始的时候，n2为新节点，在mountElement节点保存了el
    // 但是如果需要更新的话，n2又是一个新节点，然而却没有保存el，所以需要赋值
    const el = (n2.el = n1.el)
    // 为什么这里的el是n1（旧节点的el）
    // 因为n1是旧节点，旧节点的el是已经渲染好的，涉及到更新的话，就是更新旧节点就行
    patchProps(el, oldProps, newProps)
    patchChildren(n1, n2, el, parentComponent, anchor)
  }

  function patchProps(el, oldProps, newProps) {
    // 三种情况
    // 1. 旧值和新值不一样 -> update
    // 2. null || undefined -> del
    // 3. 新值有，旧值没有 -> del 旧的
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prevProp = oldProps[key]
        const nextProp = newProps[key]

        if (prevProp !== nextProp) {
          hostPatchProp(el, key, prevProp, nextProp)
        }
      }

      // 删除某个属性，前面的也要判断
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
    }
  }

  function patchChildren(n1, n2, container, parentComponent, anchor) {
    // 这里el是旧节点的el
    const prevShapeFlag = n1.shapeFlags
    const nextshapeFlags = n2.shapeFlags
    const c1 = n1.children
    const c2 = n2.children

    // 之前是数组，现在是数组or文本
    if (nextshapeFlags & ShapeFlags.TEXT_CHILDREN) {
      // 之前是数组，现在是文本
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 1.把老的数组的children全部删除
        unmountChildren(n1.children)
      }

      // 之前是文本，现在是文本
      if (c1 !== c2) {
        // 2. 设置新的文本
        hostSetElementText(container, c2)
      }
    } else {
      // 之前是文本
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 1. 清空文本
        hostSetElementText(container, '')
        mountChildren(c2, container, parentComponent, anchor)
      } else {
        // array diff array
        patchKeyedChildren(c1, c2, container, parentComponent, anchor)
      }
    }
  }

  function unmountChildren(children) {
    children.forEach(child => {
      hostRemove(child.el)
    })
  }

  function mountElement(vnode: any, container: any, parentComponent, anchor) {
    const el = (vnode.el = hostCreateElement(vnode.type))

    // 处理children
    const { children, shapeFlags } = vnode

    /**
     * 1. 如果是字符串，那么就是文本节点
     * 2. 如果是数组，那么就是多个子节点,递归调用patch
     */
    if (shapeFlags & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if (shapeFlags & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el, parentComponent, anchor)
    }

    // props
    const { props } = vnode
    for (const key in props) {
      // 不会遍历原型链上的属性
      if (Object.prototype.hasOwnProperty.call(props, key)) {
        const value = props[key]
        hostPatchProp(el, key, null, value)
      }
    }

    hostInsert(el, container, anchor)
  }

  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach(child => {
      patch(null, child, container, parentComponent, anchor)
    })
  }

  function patchKeyedChildren(
    c1,
    c2,
    container,
    parentComponent,
    parentAnchor
  ) {
    // 新数组的当前索引
    let i = 0
    // e1，e2是旧新数组的最后一个索引
    let l2 = c2.length
    let e1 = c1.length - 1
    let e2 = l2 - 1

    function isSameVNodeType(n1, n2) {
      // 判断这两个节点是否是同一个节点
      // 主要判断他们的type和key
      return n1.type === n2.type && n1.key === n2.key
    }

    // 左侧 -> 找出左边相同的节点，并且更新
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      // 为什么相同的节点也要更新？
      // 每个组件实例都具有自己的状态和属性，这些状态和属性可以随时更改。
      // 因此，即使两个虚拟节点看起来相同，它们可能代表的组件实例的状态和属性可能已经发生了变化。
      // 在这种情况下，需要使用新的属性和状态来更新组件。
      // 调用patch后还会再次调用patchProps和children，来检查属性和子节点

      // 其实如果key相同的话，结果只是一样的，仅仅是比较多了一位而已
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }
      i++
    }

    //右侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break
      }
      e1--
      e2--
    }

    // i是当前新旧节点不一样的位置
    // e1是旧与新节点不一样，旧的最后一个位置
    // e2是旧与新节点不一样，新的最后一个位置

    // 当前i，e1，e2的位置位置已经确定，进行增、删、移动等操作

    // so，在父容器到基础上，创建就用新的节点，删除就用老的节点，这样提高性能

    // 新的比老的节点多 创建

    if (i > e1) {
      if (i <= e2) {
        // 左右侧已经判断完毕 -> 添加：选择在xxx前插入，所以+1。
        const nextPos = e2 + 1
        const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor
        while (i <= e2) {
          // 新的比老的节点多 创建
          patch(null, c2[i], container, parentComponent, anchor)
          i++
        }
      }
    } else if (i > e2) {
      // 老的比新的多 删除
      while (i <= e1) {
        hostRemove(c1[i].el)
        i++
      }
    } else {
      // 中间对比
      let s1 = i // 老节点的开始
      let s2 = i // 新节点的开始

      /**
       * 这里用于删除节点时
       * 如果新节点已经被遍历/删除了，那么老节点就不需要再遍历了，直接删除
       */
      const toBePatched = e2 - s2 + 1 // 新节点的长度
      let patched = 0 // 已经更新的节点的个数

      // 存的是新节点的key和索引的映射
      const keyToNewIndexMap = new Map()

      /**
       * 最长递增子序列思想：
       * 根据索引来判断，如果新节点的索引是递增的，就保存下来
       * 然后就可以知道，哪些节点是需要移动或者删除的
       *
       */
      // 创建一个定长的数组，节省性能,如果检测到为0，就证明节点在老的里面不存在，需要创建
      const newIndexToOldIndexMap = new Array(toBePatched)
      for (let i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0

      /**
       * 判断节点是否需要移动
       */
      let moved = false
      let maxNewIndexSoFar = 0

      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i]
        keyToNewIndexMap.set(nextChild.key, i)
      }

      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i] // 拿到老节点
        let newIndex

        // 如果新节点已经遍历完了，老节点后面还有值，则把老节点后面的全部删除
        if (patched >= toBePatched) {
          hostRemove(prevChild.el)
          continue
        }

        // 这里会满足null和undefined
        if (prevChild.key !== null) {
          // 有之前的key，不用去对比
          newIndex = keyToNewIndexMap.get(prevChild.key)
        } else {
          // 如果之前的节点没有key属性，需要在新节点列表中查找与之前节点相同类型的节点
          // 从后往前遍历新节点列表，查找第一个与之前节点类型相同的节点
          for (let j = s2; i <= e2; i++) {
            if (isSameVNodeType(prevChild, c2[j])) {
              newIndex = j
              break
            }
          }
        }

        // 删除操作
        if (newIndex === undefined) {
          // 没有找到/key不一样，就删除
          hostRemove(prevChild.el)
        } else {
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex
          } else {
            // 认定当前节点是需要移动的，否则就跳过，因为进行最长递增子序列判断也是需要一定性能的
            moved = true
          }

          // 找到相同节点，更新
          // 存储相同节点的索引
          newIndexToOldIndexMap[newIndex - s2] = i + 1
          patch(prevChild, c2[newIndex], container, parentComponent, null)
          patched++
        }
      }

      // abc
      // ebc -> 12
      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : []
      let j = increasingNewIndexSequence.length - 1
      // 倒序开始循环
      // 这里倒序是因为在insert的时候，需要保证锚点是处理完的节点，也就是已经确定位置的节点

      for (let i = toBePatched - 1; i >= 0; i--) {
        // 新节点的索引（倒序）
        const nextIndex = i + s2
        const nextChild = c2[nextIndex]
        // 插入到下一个节点的前面，如果没有就插入到最后
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null

        // 新增操作
        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, parentComponent, anchor)
        }

        if (moved) {
          // 如果新节点的索引不在递增的序列中，就插入
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            // 移动操作
            hostInsert(nextChild.el, container, anchor)
          } else {
            j--
          }
        }
      }
    }
  }

  function processComponent(n1, n2, container, parentComponent, anchor) {
    if (!n1) {
      mountComponent(n2, container, parentComponent, anchor)
    } else {
      updateComponent(n1, n2, container)
    }
  }

  function mountComponent(initialVNode, container, parentComponent, anchor) {
    const instance = (initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent
    ))
    // 初始化组件 调用setup函数，如果有就执行
    setupComponent(instance)
    // 渲染-> 调用render函数
    setupRenderEffect(instance, initialVNode, container, anchor)
  }

  function updateComponent(n1, n2, container) {
    // 为什么需要提上来？
    // 因为如果不需要更新的话，他的n2就不会被赋值了，
    // 这样就会导致后面的n2 拿到的是一个空的
    const instance = (n2.component = n1.component)

    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2
      instance.update()
    } else {
      n2.el = n1.el
      instance.vnode = n2
    }
  }

  function setupRenderEffect(
    instance: any,
    initialVNode: any,
    container: any,
    anchor
  ) {
    // 当响应式对象改变的时候，重新执行render函数,这里的render

    // 为什么这里的effect会被执行?
    // 因为这里对响应式对象进行了get操作，所以会触发effect，所以把这里整个函数都存起来
    // 下一次响应式数据变化了，整个函数重新执行
    instance.update = effect(
      () => {
        if (!instance.isMounted) {
          const { proxy } = instance

          // 在初始化的时候存了旧节点
          //  第二个proxy 指render函数的第一个参数ctx
          const subTree = (instance.subTree = instance.render.call(
            proxy,
            proxy
          ))
          // vnode -> patch
          // vnode -> element -> mountElement
          // 初始化没有旧节点，所以传入null
          patch(null, subTree, container, instance, anchor)
          // 所有的element都已经mount之后
          initialVNode.el = subTree.el

          instance.isMounted = true
        } else {
          // 需要一个vnode更新后的
          const { vnode, next } = instance
          if (next) {
            next.el = vnode.el
            // 更新组件上的props
            updateComponentPreRender(instance, next)
          }
          const { proxy } = instance
          //  第二个proxy 指render函数的第一个参数ctx
          const subTree = instance.render.call(proxy, proxy)
          const prevTree = instance.subTree
          // 继续把当前节点赋值为旧节点，这样下次更新的时候，就可以拿到旧节点了
          instance.subTree = subTree

          patch(prevTree, subTree, container, instance, anchor)
        }
      },
      {
        scheduler() {
          queueJobs(instance.update)
        }
      }
    )
  }

  return {
    createApp: createAppAPI(render)
  }
}

function updateComponentPreRender(instance, nextVnode) {
  instance.vnode = nextVnode
  instance.next = null
  instance.props = nextVnode.props
}

/**
 *
 * @param arr
 * @returns number[]
 */
function getSequence(arr: number[]): number[] {
  const p = arr.slice()
  const result = [0]
  let i, j, u, v, c
  const len = arr.length
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      j = result[result.length - 1]
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i)
        continue
      }
      u = 0
      v = result.length - 1
      while (u < v) {
        c = (u + v) >> 1
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]
        }
        result[u] = i
      }
    }
  }
  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
}

// diff 算法流程：
// 1. 先对比两边，两边做创建和删除操作（注意没有移动，不一样的就删除），这里调用patch重新渲染节点，
// 为什么重新渲染，因为他们的props和children有可能发生变化，需要重新判断
// 2. 然后锁定中间不一样的
// 3. 删除老的节点 -> 在老的存在，新的不存在 -> 需要删除，否则重新渲染节点
// 在此之间，判断需要是否移动
// 4. 判断是否需要移动，为什么需要判断？为了减少最长递增子序列的判断，减少移动次数 -> 因为这个算法也会消耗一定性能
// 5. 等到删除逻辑全部执行完后，进行最长递增子序列对比
// 6. 新节点在老节点的索引位置数组（key新节点：老节点索引）-> 求最长递增子序列 -> 如果没有变化的话，索引是递增的，得到新节点有哪些是递增，返回数组
// 7. 通过映射判断，在老节点不存在，新节点存在的元素，直接通过patch新增
// 8. 递增数组 -> 找到不是递增的元素（需要移动）的索引和dom元素，在移动位置的元素前一个位置新增元素
// 9. 新增和移动的锚点如何确定？
// 10. 倒序判断新节点数组，判断当前元素是否在递增数组中，如果不在就需要移动/新增，
// 11. 因为前面的已经判断过了，能确定他们是稳定不需要移动的节点，而新节点的位置是在他们的前面，所以直接移动或者插入到他们的前面

// 思考
// 最长递增子序列做了哪些事情
// 为什么用它，解决了什么问题

//答： 找到了新节点（去掉相同节点的）需要移动的节点，为了减少移动次数
// 那么为什么最长递增子序列就可以保证移动次数最少呢？
// 因为在位置数组中递增就能保证在旧数组中的相对位置的有序性，从而不需要移动，
// 因此递增子序列的最长可以保证移动次数的最少
