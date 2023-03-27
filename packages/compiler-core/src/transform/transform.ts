export function transform(root, options = {}) {
  const ctx = createTransformContext(root, options)
  // 1. 遍历 -> 深度优先搜索
  // 2. 修改 text content
  tranverseNode(root, ctx)

  //root.codeGenNode
  // 要对哪棵树进行修改
  createRootCodeGen(root)
}

function createTransformContext(root: any, options: any) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || []
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

  // 递🐢遍历孩子节点
  traverseChildren(children, ctx)
}

function traverseChildren(children: any, ctx: any) {
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i]
      tranverseNode(node, ctx)
    }
  }
}
