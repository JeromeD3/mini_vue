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
        tag: 'div',
        children: []
      })
    })
  })

  describe('element', () => {
    it('simple element text', () => {
      const ast = baseParse('some text')

      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.TEXT,
        content: 'some text'
      })
    })
  })

  it('union', () => {
    const ast = baseParse('<p>hi, {{ message }}</p>')

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: 'p',
      children: [
        {
          type: NodeTypes.TEXT,
          content: 'hi, '
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: 'message'
          }
        }
      ]
    })
  })

  it('nest Element', () => {
    const ast = baseParse('<p><div>hi</div>hi, {{ message }}</p>')

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: 'p',
      children: [
        {
          type: NodeTypes.ELEMENT,
          tag: 'div',
          children: [
            {
              type: NodeTypes.TEXT,
              content: 'hi'
            }
          ]
        },
        {
          type: NodeTypes.TEXT,
          content: 'hi, '
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: 'message'
          }
        }
      ]
    })
  })

  test('parse error when lack end tag', () => {
    expect(() => {
      baseParse('<div></p>')
    }).toThrow(`标签不匹配,缺少div标签`)
  })
})
