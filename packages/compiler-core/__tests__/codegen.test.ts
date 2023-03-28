import { generate } from '../src/codegen'
import { baseParse } from '../src/parser'
import { transform } from '../src/transform'
import { transformExpression } from '../src/transform/transformExpression'

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
})
