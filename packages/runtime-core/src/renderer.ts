import { ShapeFlags } from '../../shared/src/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { Fragment, Text } from './vnode'

export function render(vnode, container) {
  // patch
  patch(vnode, container)
}

function patch(vnode, container) {
  // 1. 判断新旧vnode是否是同一个对象
  // 2. 如果是同一个对象，那么就是更新操作
  // 3. 如果不是同一个对象，那么就是替换操作

  // ShapeFlags -> 标识 vnode 有哪几种 flag
  const { shapeFlags, type } = vnode

  //Fragement -> 只渲染children

  switch (type) {
    case Fragment:
      processFragment(vnode, container)
      break
    case Text:
      processText(vnode, container)
      break
    default:
      if (shapeFlags & ShapeFlags.ELEMENT) {
        processElement(vnode, container)
      } else if (shapeFlags & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container)
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

function processFragment(vnode, container) {
  mountChildren(vnode.children, container)
}

function processElement(vnode, container) {
  // init -> update
  mountElement(vnode, container)
}

function mountElement(vnode: any, container: any) {
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
    mountChildren(children, el)
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

function mountChildren(children, container) {
  children.forEach(child => {
    patch(child, container)
  })
}

function processComponent(initialVNode, container) {
  mountComponent(initialVNode, container)
}

function mountComponent(initialVNode, container) {
  const instance = createComponentInstance(initialVNode)
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
  patch(subTree, container)

  // 所有的element都已经mount之后
  initialVNode.el = subTree.el
}
