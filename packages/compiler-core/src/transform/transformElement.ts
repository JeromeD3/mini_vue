import { createVNodeCall, NodeTypes } from '../ast'

// 对于element节点的处理
// 就是将他们的props，tag，children等信息转换成codeGenNode
// 待codegen的时候，就可以直接调用codeGenNode生成代码
export function transformElement(node, ctx) {
  if (node.type === NodeTypes.ELEMENT) {
    return () => {
      // 中间处理层
      //tag
      const vnodeTag = `'${node.tag}'`

      // props
      let vnodeProps

      //children
      const children = node.children

      const vnodeChildren = children[0]

      node.codeGenNode = createVNodeCall(
        ctx,
        vnodeTag,
        vnodeProps,
        vnodeChildren
      )
    }
  }
}
