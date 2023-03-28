import { NodeTypes } from './ast'
import { helperNameMap, TO_DISPLAY_STRING } from './runtimeHelper'

export function generate(ast) {
  const ctx = createCodegenContext()
  const { push } = ctx

  // 获取function的前导码
  getFuntionPreamble(ast, ctx)

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
    },
    helper(key) {
      return `_${helperNameMap[key]}`
    }
  }
  return ctx
}

function genNode(node: any, ctx) {
  // 判断生成的节点类型
  switch (node.type) {
    // 纯字符串
    case NodeTypes.TEXT:
      genText(node, ctx)
      break
    // 带{{}}
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, ctx)
      break
    // {{}} 里面的内容
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, ctx)
      break
    default:
      break
  }
}

function genText(node: any, ctx: any) {
  const { push } = ctx

  push(`'${node.content}'`)
}

function genInterpolation(node: any, ctx: any) {
  const { push, helper } = ctx
  push(helper(TO_DISPLAY_STRING))
  push(`(`)
  genNode(node.content, ctx)
  push(`)`)
}

function genExpression(node: any, ctx: any) {
  const { push } = ctx
  push(`${node.content}`)
}

/**
 *  生成需要导入的库
 * @param ast
 * @param ctx
 */
function getFuntionPreamble(ast, ctx) {
  const { push, helper } = ctx
  const VueBinging = 'Vue'
  const aliasHelper = s => `${helperNameMap[s]}:${helper(s)}`

  if (ast.helpers.length > 0) {
    push(`const { ${ast.helpers.map(aliasHelper).join(',')} } = ${VueBinging}`)
  }
  push('\n')
  push('return ')
}
