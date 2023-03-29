import { NodeTypes } from './ast'
import { TO_DISPLAY_STRING } from './runtimeHelper'

/**
 * 主要的功能就是对ast树进行修改，方便我们后续生成最终的代码
 * @param root
 * @param options
 */
export function transform(root, options = {}) {
  const ctx = createTransformContext(root, options)
  // 1. 遍历 -> 深度优先搜索
  // 2. 修改 text content
  tranverseNode(root, ctx)

  //root.codeGenNode
  // 要对哪棵树进行修改
  createRootCodeGen(root)

  //为什么根节点需要呢？
  // 在生成导入所需的库的时候会用到

  root.helpers = [...ctx.helpers.keys()]
}

function createTransformContext(root: any, options: any) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || [],
    helpers: new Map(),
    helper(key) {
      context.helpers.set(key, 1)
    }
  }
  return context
}

function createRootCodeGen(root: any) {
  const child = root.children[0]

  // 如果根节点是element，就进行特殊处理
  // 为啥需要特殊处理呢？，因为ELEMENT类型里面可能有多个孩子，孩子可能是文本，也可能是插值
  // 到时候又会递🐢遍历去处理

  // 这里的codeGenNode是用来特殊处理的，然后生成到ctx中去
  if (child.type === NodeTypes.ELEMENT) {
    root.codeGenNode = child.codeGenNode
  } else {
    root.codeGenNode = root.children[0]
  }
}

function tranverseNode(node: any, ctx) {
  const nodeTransforms = ctx.nodeTransforms
  const exitFn: any = []
  // 每一个节点都执行一遍插件，判断是否需要修改
  for (let i = 0; i < nodeTransforms.length; i++) {
    const nodetransform = nodeTransforms[i]

    const onExit = nodetransform(node, ctx)
    // transformExpression 插件没有返回值，因为他是直接执行的，而不是返回函数
    if (onExit) {
      exitFn.push(onExit)
    }
  }

  //判断孩子是什么类型的
  switch (node.type) {
    case NodeTypes.INTERPOLATION:
      // 插值的时候添加toDisplayStrNing
      ctx.helper(TO_DISPLAY_STRING)
      break
    case NodeTypes.ROOT:
    case NodeTypes.ELEMENT:
      // 递🐢遍历孩子节点
      traverseChildren(node.children, ctx)
      break
    default:
      break
  }

  let i = exitFn.length
  while (i--) {
    // 这里只有transformExpression这个插件会先执行，其他的都是返回函数在这里执行
    exitFn[i]()
  }
}

function traverseChildren(children: any, ctx: any) {
  for (let i = 0; i < children.length; i++) {
    const node = children[i]
    tranverseNode(node, ctx)
  }
}
