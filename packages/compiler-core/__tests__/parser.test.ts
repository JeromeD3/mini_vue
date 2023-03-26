import { NodeTypes } from '../src/ast'
import { baseParse } from '../src/parser'

describe('Parse', () => {
  describe('interpolation', () => {
    test('simple', () => {
      // 解析单个
      const ast = baseParse('{{ message }}')
      // root
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: 'message'
        }
      })
    })
  })

  describe('element', () => {
    it('simple element div', () => {
      const ast = baseParse('<div></div>')

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.ELEMENT,
        tag: 'div'
      })
    })
  })
})
