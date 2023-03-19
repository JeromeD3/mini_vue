import { ShapeFlags } from '../../shared/src/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { Fragment, Text } from './vnode'

export function render(vnode, container) {
  // 这里只会执行一次，因为是根节点，所以没有父节点，so，下面的父节点给了null
  // patch
  patch(vnode, container, null)
}

function patch(vnode, container, parentComponent) {
  // 1. 判断新旧vnode是否是同一个对象
  // 2. 如果是同一个对象，那么就是更新操作
  // 3. 如果不是同一个对象，那么就是替换操作

  // ShapeFlags -> 标识 vnode 有哪几种 flag
  const { shapeFlags, type } = vnode

  //Fragement -> 只渲染children

  switch (type) {
    case Fragment:
      processFragment(vnode, container, parentComponent)
      break
    case Text:
      processText(vnode, container)
      break
    default:
      if (shapeFlags & ShapeFlags.ELEMENT) {
        processElement(vnode, container, parentComponent)
      } else if (shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container, parentComponent)
      }
      break
  }
}

function processText(vnode, container) {
  // Text类型的vnode，children就是文本内容，跳过渲染mountElement，直接渲染文本节点
  const { children } = vnode
  const textNode = (vnode.el = document.createTextNode(children))
  container.append(textNode)
}

function processFragment(vnode, container, parentComponent) {
  mountChildren(vnode.children, container, parentComponent)
}

function processElement(vnode, container, parentComponent) {
  // init -> update
  mountElement(vnode, container, parentComponent)
}

function mountElement(vnode: any, container: any, parentComponent) {
  const el = (vnode.el = document.createElement(vnode.type))

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
      const isOn = (key: string) => /^on[A-Z]/.test(key)
      if (isOn(key)) {
        const event = key.slice(2).toLowerCase()
        el.addEventListener(event, value)
      } else {
        el.setAttribute(key, value)
      }
    }
  }
  container.appendChild(el)
}

function mountChildren(children, container, parentComponent) {
  children.forEach(child => {
    patch(child, container, parentComponent)
  })
}

function processComponent(initialVNode, container, parentComponent) {
  mountComponent(initialVNode, container, parentComponent)
}

function mountComponent(initialVNode, container, parentComponent) {
  const instance = createComponentInstance(initialVNode, parentComponent)
  // 初始化组件 调用setup函数，如果有就执行
  setupComponent(instance)
  // 渲染-> 调用render函数
  setupRenderEffect(instance, initialVNode, container)
}

function setupRenderEffect(instance: any, initialVNode: any, container: any) {
  const { proxy } = instance
  const subTree = instance.render.call(proxy)
  // vnode -> patch
  // vnode -> element -> mountElement
  patch(subTree, container, instance)

  // 所有的element都已经mount之后
  initialVNode.el = subTree.el
}
