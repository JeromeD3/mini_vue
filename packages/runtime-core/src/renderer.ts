import { createComponentInstance, setupComponent } from './component'
import { isObject } from '../../shared/src/index'

export function render(vnode, container) {
  // patch
  patch(vnode, container)
}

function patch(vnode, container) {
  // 1. 判断新旧vnode是否是同一个对象
  // 2. 如果是同一个对象，那么就是更新操作
  // 3. 如果不是同一个对象，那么就是替换操作
  if (typeof vnode.type === 'string') {
    processElement(vnode, container)
  } else if (isObject(vnode.type)) {
    processComponent(vnode, container)
  }
}

function processComponent(vnode, container) {
  console.log('processComponent执行了，vnode---->', vnode)

  mountComponent(vnode, container)
}

function processElement(vnode, container) {
  console.log('processElement执行了，vnode---->', vnode)
  // init -> update
  mountElement(vnode, container)
}

function mountElement(vnode: any, container: any) {
  const el = document.createElement(vnode.type)
  // console.log(vnode)
  // console.log(container)
  // 处理children
  const { children } = vnode

  /**
   * 1. 如果是字符串，那么就是文本节点
   * 2. 如果是数组，那么就是多个子节点,递归调用patch
   */
  if (typeof children === 'string') {
    el.textContent = children
  } else if (Array.isArray(children)) {
    // console.log(children)
    mountChildren(children, el)
  }

  // props
  const { props } = vnode
  for (const key in props) {
    // console.log(key)
    if (Object.prototype.hasOwnProperty.call(props, key)) {
      const value = props[key]
      el.setAttribute(key, value)
    }
  }
  container.appendChild(el)
}

function mountChildren(children, container) {
  children.forEach(child => {
    patch(child, container)
  })
}

function mountComponent(vnode, container) {
  const instance = createComponentInstance(vnode)
  // 初始化组件 调用setup函数，如果有就执行
  setupComponent(instance)
  // 渲染-> 调用render函数
  setupRenderEffect(instance, container)
}
function setupRenderEffect(instance: any, container: any) {
  const { proxy } = instance
  console.log(instance)
  const subTree = instance.render.call(proxy)
  console.log(subTree)
  // vnode -> patch
  // vnode -> element -> mountElement
  patch(subTree, container)
}
