import { isString } from '../../shared/src'
import { NodeTypes } from './ast'
import {
  CREATE_ELEMENT_VNODE,
  helperNameMap,
  TO_DISPLAY_STRING
} from './runtimeHelper'

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
    // <div></div>
    case NodeTypes.ELEMENT:
      genElement(node, ctx)
      break
    // <div>h1, {{message}}</div>
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, ctx)
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

function genElement(node: any, ctx: any) {
  const { push, helper } = ctx
  const { tag, children, props } = node

  push(`${helper(CREATE_ELEMENT_VNODE)}(`)

  //对tag,props,children统一进行处理,如果为空，返回something..
  genNodelist(genNullable([tag, props, children]), ctx)
  // genNode(children, ctx)

  push(')')
}

// 编译成组合类型
function genCompoundExpression(node: any, ctx: any) {
  const { push } = ctx
  const children = node.children

  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    // 这里的string主要是加号➕
    if (isString(child)) {
      push(child)
    } else {
      genNode(child, ctx)
    }
  }
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

// 生成tag, props, children这些信息时中间添加逗号
function genNodelist(nodes, ctx) {
  const { push } = ctx

  nodes.map((node, i) => {
    if (isString(node)) {
      push(node)
    } else {
      genNode(node, ctx)
    }
    if (i < nodes.length - 1) push(',')
  })
}

// 对undifined的元素转成null
function genNullable(args: any[]) {
  return args.map(arg => arg || 'null')
}
