import { render } from './renderer'
import { createVNode } from './vnode'

export function createApp(rootComponent) {
  return {
    // example: app.mount('#app')
    mount(rootContainer) {
      // 会先基于根容器 创建vnode
      // 所有的操作逻辑 都会基于vnode来做处理
      const vnode = createVNode(rootComponent)

      render(vnode, rootContainer)
    },
  }
}
