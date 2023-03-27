export function generate(ast) {
  const ctx = createCodegenContext()
  const { push } = ctx
  push('return ')

  const functionName = 'render'
  const args = ['_ctx', '_cache', '$props', '$setup', '$data', '$options']
  const signature = args.join(',')

  push(`function ${functionName}(${signature}){`)
  push(`return `)
  genNode(ast.codeGenNode, ctx)
  push(`}`)

  return {
    code: ctx.code
  }
}

function createCodegenContext() {
  const ctx = {
    code: '',
    push(source) {
      ctx.code += source
    }
  }
  return ctx
}

function genNode(node: any, ctx) {
  const { push } = ctx
  push(`'${node.content}'`)
}
