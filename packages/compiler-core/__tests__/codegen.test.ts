import { generate } from '../src/codegen'
import { baseParse } from '../src/parser'
import { transform } from '../src/transform'
import { transformExpression } from '../src/transform/transformExpression'
import { transformElement } from '../src/transform/transformElement'
import { transformText } from '../src/transform/transformText'

describe('codegen', () => {
  it('string', () => {
    const ast = baseParse('hi')

    transform(ast)

    const { code } = generate(ast)

    // 快照
    // 1. 抓bug
    // 2. 有意

    expect(code).toMatchSnapshot()
  })

  it('interpolation', () => {
    const ast = baseParse('{{ hi }}')

    // 创建插件，动态添加.ctx
    transform(ast, {
      nodeTransforms: [transformExpression]
    })

    const { code } = generate(ast)
    expect(code).toMatchSnapshot()
  })

  it('element', () => {
    const ast: any = baseParse('<div>h1, {{message}}</div>')

    transform(ast, {
      // 为什么一开始不匹配？
      // 因为一开始是根节点，是不需要修改的，而他们的孩子节点（表达式）需要修改
      // 但是按顺序执行插件后，transformElement已经把孩子节点改成复合的了
      // 所以一开始的transformExpression会失效
      nodeTransforms: [transformExpression, transformElement, transformText]
    })

    const { code } = generate(ast)

    expect(code).toMatchSnapshot()
  })
})
