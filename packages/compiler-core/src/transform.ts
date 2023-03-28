import { NodeTypes } from './ast'
import { TO_DISPLAY_STRING } from './runtimeHelper'

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
  root.codeGenNode = root.children[0]
}

function tranverseNode(node: any, ctx) {
  const children = node.children

  const nodeTransforms = ctx.nodeTransforms

  // 每一个节点都执行一遍插件，判断是否需要修改
  for (let i = 0; i < nodeTransforms.length; i++) {
    const nodetransform = nodeTransforms[i]
    nodetransform(node)
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
      traverseChildren(children, ctx)
      break
    default:
      break
  }
}

function traverseChildren(children: any, ctx: any) {
  for (let i = 0; i < children.length; i++) {
    const node = children[i]
    tranverseNode(node, ctx)
  }
}
