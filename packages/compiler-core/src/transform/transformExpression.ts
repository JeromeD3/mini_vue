import { NodeTypes } from '../ast'

// 主要给表达式添加一个_ctx
export function transformExpression(node) {
  if (node.type === NodeTypes.INTERPOLATION) {
    node.content = processExpression(node.content)
  }
}

function processExpression(node: any) {
  node.content = `_ctx.${node.content}`
  return node
}
