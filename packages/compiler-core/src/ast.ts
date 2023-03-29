import { CREATE_ELEMENT_VNODE } from './runtimeHelper'

export const enum NodeTypes {
  INTERPOLATION,
  SIMPLE_EXPRESSION,
  ELEMENT,
  TEXT,
  ROOT,
  COMPOUND_EXPRESSION
}

export enum TagType {
  START,
  END
}

export function createVNodeCall(ctx, vnodeTag, vnodeProps, vnodeChildren) {
  ctx.helper(CREATE_ELEMENT_VNODE)

  return {
    type: NodeTypes.ELEMENT,
    tag: vnodeTag,
    props: vnodeProps,
    children: vnodeChildren
  }
}
