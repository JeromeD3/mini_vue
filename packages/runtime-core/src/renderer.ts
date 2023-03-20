import { ShapeFlags } from '../../shared/src/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { createAppAPI } from './createApp'
import { Fragment, Text } from './vnode'
import { effect } from '../../reactivity/src/effect'
import { EMPTY_OBJ } from '../../shared/src/'

export function createRenderer(options) {
  const {
    createElement: hostCreateElement,
    // setElementText: hostSetElementText,
    patchProp: hostPatchProp,
    insert: hostInsert
    // remove: hostRemove,
    // setText: hostSetText,
    // createText: hostCreateText,
  } = options

  function render(vnode, container) {
    // 这里只会执行一次，因为是根节点，所以没有父节点，so，下面的父节点给了null
    // patch
    patch(null, vnode, container, null)
  }

  // n1->oldVnode
  // n2->newVnode
  function patch(n1, n2, container, parentComponent) {
    // 1. 判断新旧vnode是否是同一个对象
    // 2. 如果是同一个对象，那么就是更新操作
    // 3. 如果不是同一个对象，那么就是替换操作

    // ShapeFlags -> 标识 vnode 有哪几种 flag
    const { shapeFlags, type } = n2

    //Fragement -> 只渲染children

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlags & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent)
        } else if (shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent)
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

  function processFragment(n1, n2, container, parentComponent) {
    mountChildren(n2.children, container, parentComponent)
  }

  function processElement(n1, n2, container, parentComponent) {
    if (!n1) {
      // init
      mountElement(n2, container, parentComponent)
    } else {
      // update
      patchElement(n1, n2, container)
    }
  }

  function patchElement(n1, n2, container) {
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ
    // 为什么n2这里需要赋值？ 因为一开始的时候，n2为新节点，在mountElement节点保存了el
    // 但是如果需要更新的话，n2又是一个新节点，然而却没有保存el，所以需要赋值
    const el = (n2.el = n1.el)
    // 为什么这里的el是n1（旧节点的el）
    // 因为n1是旧节点，旧节点的el是已经渲染好的，涉及到更新的话，就是更新旧节点就行
    patchProps(el, oldProps, newProps)
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

  function mountElement(vnode: any, container: any, parentComponent) {
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
      mountChildren(children, el, parentComponent)
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

    hostInsert(el, container)
  }

  function mountChildren(children, container, parentComponent) {
    children.forEach(child => {
      patch(null, child, container, parentComponent)
    })
  }

  function processComponent(n1, n2, container, parentComponent) {
    mountComponent(n2, container, parentComponent)
  }

  function mountComponent(initialVNode, container, parentComponent) {
    const instance = createComponentInstance(initialVNode, parentComponent)
    // 初始化组件 调用setup函数，如果有就执行
    setupComponent(instance)
    // 渲染-> 调用render函数
    setupRenderEffect(instance, initialVNode, container)
  }

  function setupRenderEffect(instance: any, initialVNode: any, container: any) {
    // 当响应式对象改变的时候，重新执行render函数,这里的render

    // 为什么这里的effect会被执行?
    effect(() => {
      if (!instance.isMounted) {
        const { proxy } = instance
        // 在初始化的时候存了旧节点
        const subTree = (instance.subTree = instance.render.call(proxy))
        // vnode -> patch
        // vnode -> element -> mountElement
        // 初始化没有旧节点，所以传入null
        patch(null, subTree, container, instance)
        // 所有的element都已经mount之后
        initialVNode.el = subTree.el

        instance.isMounted = true
      } else {
        const { proxy } = instance
        const subTree = instance.render.call(proxy)
        const prevTree = instance.subTree
        // 继续把当前节点赋值为旧节点，这样下次更新的时候，就可以拿到旧节点了
        instance.subTree = subTree

        patch(prevTree, subTree, container, instance)
      }
    })
  }
  return {
    createApp: createAppAPI(render)
  }
}
