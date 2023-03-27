import { generate } from '../src/codegen'
import { baseParse } from '../src/parser'
import { transform } from '../src/transform/transform'

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
})
