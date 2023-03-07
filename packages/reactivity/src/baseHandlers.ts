// import { isObject } from 'packages/shared'
import { isObject } from '@mini_vue/shared'
import { track, trigger } from './effect'
import { reactive, readonly } from './reactive'

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
function createGetter(isReadonly = false) {
  return function get(target, key) {
    // target :{age: 10}
    // key:age
    // value: 10
    if (key === '__v_isReactive') {
      return !isReadonly
    } else if (key === '__v_isReadonly') {
      return isReadonly
    }

    const res = Reflect.get(target, key)

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
  set,
}
export const readonlyHandlers: ProxyHandler<any> = {
  get: readonlyGet,
  set(_, key) {
    console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`)
    return true
  },
}
