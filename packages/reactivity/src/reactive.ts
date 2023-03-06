import { mutableHandlers, readonlyHandlers } from './baseHandlers'

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

function createActiveObject(target, baseHandlers) {
  return new Proxy(target, baseHandlers)
}

export function isReactive(value) {
  return !!value[reactiveFlags.IS_REACTIVE]
}

export function isReadonly(value) {
  return !!value[reactiveFlags.IS_READONLY]
}

