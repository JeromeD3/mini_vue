import { NodeTypes } from './ast'

export function isText(node) {
  // 2/3
  return node.type === NodeTypes.TEXT || node.type === NodeTypes.INTERPOLATION
}
