import { NodeTypes } from '../ast'
import { baseParse } from '../parser'

describe('Parse', () => {
  describe('interpolation', () => {
    test('simple', () => {
      const ast = baseParse('{{ message }} {{ dxb }}')

      // root
      expect(ast.children[0]).toStrictEqual([
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: 'message'
          }
        }
      ])
    })
  })
})
