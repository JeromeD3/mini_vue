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

interface IText {
  type: NodeTypes.TEXT
  content: string
}

export function baseParse(content: string) {
  const context = createParserContext(content)
  return createRoot(parseChildren(context, []))
}

function parseChildren(
  context,
  ancestors
): Array<IIterpolation | IElement | IText> {
  const nodes: Array<IIterpolation | IElement | IText> = []

  while (!isEnd(context, ancestors)) {
    let node
    const s = context.source

    if (s.startsWith('{{')) {
      // 判断是否是插值
      // {{}}
      node = parseInterpolation(context)
    } else if (s[0] === '<') {
      if (/[a-z]/i.test(s[1])) {
        // <div></div>
        node = parseElement(context, ancestors)
      }
    }

    if (!node) {
      // 处理字符串
      // some text
      node = parseText(context)
    }

    nodes.push(node)
  }

  return nodes
}

function isEnd(context, ancestors) {
  // 2. 当遇到结束标签的时候
  const s = context.source

  if (s.startsWith('</')) {
    // 为什么逆序，因为如果当前标签没有出错的话，是在栈顶的
    // 逆序的话，可以直接拿到当前标签
    // 所以说更加高效
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const tag = ancestors[i].tag
      if (startsWithEndTagOpen(s, tag)) return true
    }
    return true
  }
  // 1. 当context有值当时候
  return !s
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

function parseInterpolation(context: any): IIterpolation {
  // {{message}}

  const openDelimiter = '{{'
  const closeDelimiter = '}}'

  const closeIndex = context.source.indexOf(
    closeDelimiter,
    openDelimiter.length
  )

  // 指针前进位置 -> 干掉{{
  advanceBy(context, openDelimiter.length)

  // 内容的长度
  const rawContentLength = closeIndex - openDelimiter.length

  // 未处理过的，可能有空格的情况
  // message}} -> rawcontent === message
  const rawcontent = parseTextData(context, rawContentLength)
  const content = rawcontent.trim()

  // 删除}}
  advanceBy(context, closeDelimiter.length)

  //为什么不这样写？
  // 因为后续还有其他的解析，所以不能用length来做判断
  // context.source.slice(2, context.source.length - 2)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content
    }
  }
}

function parseElement(context: any, ancestors) {
  // 1. 解析tag
  const element: any = parseTag(context, TagType.START)

  // 保存我们的tag
  ancestors.push(element)
  element.children = parseChildren(context, ancestors)
  ancestors.pop()

  //  标签相同才解析，否则抛出错误
  if (startsWithEndTagOpen(context.source, element.tag) == element.tag) {
    // 2. 解析结束tag
    parseTag(context, TagType.END)
  } else {
    throw new Error(`标签不匹配,缺少${element.tag}标签`)
  }

  return element
}

// 判断当前的标签是否与结束标签相同
function startsWithEndTagOpen(source: string, tag) {
  return (
    source.startsWith('</') &&
    source.slice(2, 2 + tag.length).toLocaleLowerCase() === tag
  )
}

function parseTag(context: any, type: TagType) {
  const match: any = /^<\/?([a-z]*)/i.exec(context.source)
  const tag = match[1]

  // 2. 删除处理完成的代码
  // 为什么要删除呢？
  // 因为后续还有其他的解析，而且这里用到了length做判断

  advanceBy(context, match[0].length + 1)

  if (type === TagType.END) return

  return {
    type: NodeTypes.ELEMENT,
    tag
  }
}

function parseText(context: any): IText {
  // 遇到{{就停止
  let endTokens = ['{{', '<']
  let endIndex = context.source.length

  // 解决标签嵌套的问题，更早的进行截取
  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i])
    if (index !== -1) {
      // 取小的index
      endIndex = Math.min(endIndex, index)
    }
  }

  const content = parseTextData(context, endIndex)

  return {
    type: NodeTypes.TEXT,
    content
  }
}

function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length)
}

/**
 * 1. 截取字符串 -> 干掉字符串  （指针移动）
 */
function parseTextData(context: any, length) {
  const content = context.source.slice(0, length)

  advanceBy(context, length)

  return content
}
