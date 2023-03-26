import { NodeTypes, TagType } from './ast'

interface IRoot {
  children: Array<IIterpolation | IElement>
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

interface IElement {
  type: NodeTypes.ELEMENT
  tag: string
}

export function baseParse(content: string) {
  const context = createParserContext(content)
  return createRoot(parserChildren(context))
}

function parserChildren(context): Array<IIterpolation | IElement> {
  // [
  //   {
  //     type: NodeTypes.INTERPOLATION,
  //     content: {
  //       type: NodeTypes.SIMPLE_EXPRESSION,
  //       content: content
  //     }
  //   }
  //
  // ]

  const nodes: Array<IIterpolation | IElement> = []
  let node
  const contextSource = context.source

  if (contextSource.startsWith('{{')) {
    // 判断是否是插值
    node = parserInterpolation(context)
  } else if (contextSource[0] === '<') {
    if (/[a-z]/i.test(contextSource[1])) {
      node = parseElement(context)
    }
  }

  nodes.push(node)

  return nodes
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

function parserInterpolation(context: any): IIterpolation {
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

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content: content
    }
  }
}

function parseElement(context: any) {
  // Implement later
  // 1. 解析tag
  const element = parserTag(context, TagType.START)
  parserTag(context, TagType.END)
  return element
}

function parserTag(context: any, type: TagType) {
  const match: any = /^<\/?([a-z]*)/i.exec(context.source)
  const tag = match[1]

  // 2. 删除处理完成的代码
  // 为什么要删除呢？
  // 因为后续还有其他的解析，而且这里用到了length做判断

  advanceBy(context, match[0].length + 1)
  console.log(match)
  console.log(context.source)

  if (type === TagType.END) return

  return {
    type: NodeTypes.ELEMENT,
    tag
  }
}

function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length)
}
