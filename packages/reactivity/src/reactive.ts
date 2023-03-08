import {
  mutableHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers
} from './baseHandlers'

export const enum reactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly'
}

export function reactive<T extends object>(target: T): T {
  return createActiveObject(target, mutableHandlers)
}

export function readonly<T extends object>(target: T): T {
  return createActiveObject(target, readonlyHandlers)
}

export function shallowReadonly(target) {
  return createActiveObject(target, shallowReadonlyHandlers)
}

export function isReactive(value) {
  // 主要是触发了get操作，如果走到了get操作，说明这个对象是响应式的
  return !!value[reactiveFlags.IS_REACTIVE]
}

export function isReadonly(value) {
  // 用readonly创建的对象，里面通过了一个变量来限制这个proxy对象的操作，比如限制收集依赖
  // 然后在get操作中，判断传递过来的对应key来返回是否为readonly
  return !!value[reactiveFlags.IS_READONLY]
}

// 检查一个对象是否是由 reactive()、readonly()、shallowReactive() 或 shallowReadonly() 创建的代理。
export function isProxy(value) {
  return isReactive(value) || isReadonly(value)
}

function createActiveObject(target, baseHandlers) {
  return new Proxy(target, baseHandlers)
}
