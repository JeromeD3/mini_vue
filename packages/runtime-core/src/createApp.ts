import { createVNode } from './vnode'

export function createAppAPI(render) {
  return function createApp(rootComponent) {
    return {
      // 因为这里首次传过来的是一个rootComponent，他的type是一个对象，所以一开始会执行processComponent
      // example: app.mount('#app')
      mount(rootContainer) {
        // 会先基于根容器 创建vnode
        // 所有的操作逻辑 都会基于vnode来做处理
        const vnode = createVNode(rootComponent)
        render(vnode, rootContainer)
      }
    }
  }
}
