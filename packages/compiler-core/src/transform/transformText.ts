import { NodeTypes } from '../ast'
import { isText } from '../utils'

// 如果是element类型
// 则对孩子做复合 ，改成组合类型（就是在他们中间添加‘号）
// INTERPOLATION和TEXT做判断，
// 因为INTERPOLATION里面也有TEXT

export function transformText(node) {
  if (node.type === NodeTypes.ELEMENT) {
    return () => {
      const { children } = node

      let currentContainer

      for (let i = 0; i < children.length; i++) {
        const child = children[i]

        if (isText(child)) {
          for (let j = i + 1; j < children.length; j++) {
            const next = children[j]

            if (isText(next)) {
              if (!currentContainer) {
                currentContainer = children[i] = {
                  type: NodeTypes.COMPOUND_EXPRESSION,
                  children: [child]
                }
              }

              currentContainer.children.push(` + `)
              currentContainer.children.push(next)
              children.splice(j, 1)
              j--
            } else {
              currentContainer = undefined
              break
            }
          }
        }
      }
    }
  }
}
