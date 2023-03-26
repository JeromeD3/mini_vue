import { NodeTypes } from './ast'

interface IRoot {
  children: Array<IIterpolation[]>
}

interface IIterpolation {
  type: NodeTypes.INTERPOLATION
  content: {
    type: NodeTypes.SIMPLE_EXPRESSION
    content: string
  }
}

interface IParserContext {
  source: string
}

export function baseParse(content: string) {
  const context = createParserContext(content)
  return createRoot(parserChildren(context))
}

function parserChildren(context): Array<IIterpolation[]> {
  // [ [
  //   {
  //     type: NodeTypes.INTERPOLATION,
  //     content: {
  //       type: NodeTypes.SIMPLE_EXPRESSION,
  //       content: content
  //     }
  //   }
  // ]
  // ]

  const nodes: IIterpolation[][] = []
  let node

  // 判断是否是插值
  if (context.source.startsWith('{{')) {
    node = parserInterpolation(context)
  }

  nodes.push(node)
  return nodes
}

function parserInterpolation(context: any): IIterpolation[] {
  // {{message}}

  const openDelimiter = '{{'
  const closeDelimiter = '}}'

  const closeIndex = context.source.indexOf(
    closeDelimiter,
    openDelimiter.length
  )

  // 推进代码，将代码按逻辑切割
  advanceBy(context, openDelimiter.length)

  const rawContentLength = closeIndex - openDelimiter.length

  // 未处理过的，可能有空格的情况
  const rawcontent = context.source.slice(0, rawContentLength)
  const content = rawcontent.trim()

  advanceBy(context, rawContentLength + closeDelimiter.length)

  //为什么不这样写？
  // 因为后续还有其他的解析，所以不能用length来做判断
  // context.source.slice(2, context.source.length - 2)

  return [
    {
      type: NodeTypes.INTERPOLATION,
      content: {
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: content
      }
    }
  ]
}

function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length)
}

function createRoot(children): IRoot {
  return {
    children
  }
}

function createParserContext(content: string): IParserContext {
  return {
    source: content
  }
}
