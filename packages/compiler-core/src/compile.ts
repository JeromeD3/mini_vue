import { baseParse } from './parser'
import { transform } from './transform'
import { transformExpression } from './transform/transformExpression'
import { transformElement } from './transform/transformElement'
import { transformText } from './transform/transformText'
import { generate } from './codegen'

export function baseCompile(template) {
  const ast: any = baseParse(template)
  transform(ast, {
    nodeTransforms: [transformExpression, transformElement, transformText]
  })

  return generate(ast)
}
