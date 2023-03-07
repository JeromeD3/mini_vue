import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from './baseHandlers'

export const enum reactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
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

function createActiveObject(target, baseHandlers) {
  return new Proxy(target, baseHandlers)
}

export function isReactive(value) {
  // 主要是触发了get操作，如果走到了get操作，说明这个对象是响应式的
  return !!value[reactiveFlags.IS_REACTIVE]
}

export function isReadonly(value) {
  return !!value[reactiveFlags.IS_READONLY]
}
