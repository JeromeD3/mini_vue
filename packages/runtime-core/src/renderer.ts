import { createComponentInstance, setupComponent } from './component'

export function render(vnode, container) {
  // patch
  patch(vnode, container)
}

function patch(vnode, container) {
  // 1. 判断新旧vnode是否是同一个对象
  // 2. 如果是同一个对象，那么就是更新操作
  // 3. 如果不是同一个对象，那么就是替换操作

  // 去处理组件

  // 判断 是不是element类型
  // processElement(vnode, container) 
  processComponent(vnode, container)
}

function processComponent(vnode, container) {
  mountComponent(vnode, container)
}
function mountComponent(vnode, container) {
  const instance = createComponentInstance(vnode)
  setupComponent(instance)
  setupRenderEffect(instance, container)
}
function setupRenderEffect(instance: any, container: any) {
  const subTree = instance.render()
  // vnode -> patch
  // vnode -> element -> mountElement
  patch(subTree, container)
}
