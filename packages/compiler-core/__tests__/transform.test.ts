import { NodeTypes } from '../src/ast'
import { baseParse } from '../src/parser'
import { transform } from '../src/transform'

describe('transform', () => {
  it('should transform simple element', () => {
    const ast = baseParse('<p>hi, {{ message }}</p>')

    const plugin = node => {
      if (node.type === NodeTypes.TEXT) {
        node.content = node.content + 'mini-vue'
      }
    }

    // 插件：对特定节点做特定操作
    transform(ast, {
      nodeTransforms: [plugin]
    })

    const nodeText = ast.children[0].children[0]
    expect(nodeText.content).toBe('hi, mini-vue')
  })
})
