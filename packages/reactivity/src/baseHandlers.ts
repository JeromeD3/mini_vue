import { extend, isObject } from '@mini_vue/shared'
import { track, trigger } from './effect'
import { reactive, reactiveFlags, readonly } from './reactive'

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key) {
    // target :{age: 10}
    // key:age
    // value: 10
    if (key === reactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === reactiveFlags.IS_READONLY) {
      return isReadonly
    }

    const res = Reflect.get(target, key)

    if (shallow) {
      return res
    }

    // 通过递🐢实现深层次的响应式，否则为shallow
    // so，在isProxy中，不用特意去判断是否为shallow
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }

    if (!isReadonly) {
      track(target, key)
    }
    return res
  }
}

function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value)
    trigger(target, key)
    return res
  }
}

export const mutableHandlers: ProxyHandler<any> = {
  get,
  set
}

export const readonlyHandlers: ProxyHandler<any> = {
  get: readonlyGet,
  set(_, key) {
    console.warn(
      `Set operation on key "${String(key)}" failed: target is readonly.`
    )
    return true
  }
}

export const shallowReadonlyHandlers: ProxyHandler<any> = extend(
  {},
  readonlyHandlers,
  {
    get: shallowReadonlyGet
  }
)
