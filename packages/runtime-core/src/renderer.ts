import { ShapeFlags } from '../../shared/src/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { createAppAPI } from './createApp'
import { Fragment, Text } from './vnode'
import { effect } from '../../reactivity/src/effect'

export function createRenderer(options) {
  const { createElement, patchProp, insert } = options

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
    }else{
      // update
      patchElement(n1, n2, container)
    }
  }

  function patchElement(n1, n2, container) {
    
  }
  
  function mountElement(vnode: any, container: any, parentComponent) {
    const el = (vnode.el = createElement(vnode.type))

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
        patchProp(el, key, value)
      }
    }

    insert(el, container)
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
        console.log('init')
        const { proxy } = instance
        const subTree = (instance.subTree = instance.render.call(proxy))
        // vnode -> patch
        // vnode -> element -> mountElement
        patch(null, subTree, container, instance)
        // 所有的element都已经mount之后
        initialVNode.el = subTree.el

        instance.isMounted = true
      } else {
        const { proxy } = instance
        const subTree = instance.render.call(proxy)
        const prevTree = instance.subTree
        instance.subTree = subTree
        console.log('update')

        patch(prevTree, subTree, container, instance)
      }
    })
  }
  return {
    createApp: createAppAPI(render)
  }
}
