import { camelize, pipe, toHandlerKey } from '@jerome778/shared'

export function emit(instance, event, ...args) {
  const { props } = instance

  const handlerName = pipe(toHandlerKey, camelize)(event)
  // const handlerName = toHandlerKey(camelize(event))

  // 执行props上的handler
  const handler = props[handlerName]
  handler && handler(...args)
}
