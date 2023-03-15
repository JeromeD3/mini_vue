export function initProps(instance, rawProps) {
  // 把instance.vnode上的props提取到instance上
  // 用{}的原因是，如果是根组件会没有props，然后报错undefined
  instance.props = rawProps || {}

}
