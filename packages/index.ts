export * from './runtime-dom/src'

import * as runtimeDom from './runtime-dom/src'
import { baseCompile } from './compiler-core/src'
import { registerRuntimeCompiler } from './runtime-dom/src'

// 返回render函数 -> vnode
function compileToFunction(template) {
  // code : render函数的字符串
  const { code } = baseCompile(template)

  /**
   * functionBodyF
   * arg0,functionBody
   */
  // 返回一个函数，code为函数体，Vue为参数
  // runtimeDom === Vue 主要用于创建虚拟dom，然后在runtimeDom中渲染
  const render = new Function('Vue', code)(runtimeDom)

  return render
}

registerRuntimeCompiler(compileToFunction)

// 执行顺序
// 1. 先将template —> 编译成render函数 === render字符串
// 2. 将render函数 -> 传到runtime-dom中 -> runtime-core中
// 3. 然后createApp -> 执行mount方法
// 4. 执行mount方法中的render方法，生成vnode -> 生成patch方法 -> 生成真实DOM
// 5. 各种操作运行时diff，patch，props,effect等等
