// import { hasChanged, isObject } from '@jerome778/shared'
import { hasChanged,isObject } from '../../shared/src'
import { isTracking, trackEffects, triggerEffects } from './effect'
import { reactive } from './reactive'

/*
 *  基本类型是通过ref
 *  对象类型是通过reactive
 *  基本类型没有get和set，所以通过class来实现它的get和set
 */
class RefImpl {
  // 用于返回的响应式对象
  private _value: any
  // 用于对比的原始值
  private _rawValue: any
  // 将effect收集到的依赖存起来
  public dep: Set<unknown>
  // 用于判断是否是ref
  public __v_isRef = true
  constructor(value) {
    // 保存原始值，后续get操作会将value转成响应式对象，
    // 所以要保存原始值用于set操作中的hasChanged的对比
    this._rawValue = value

    // 如果是对象的话，需要 value -> reactive
    this._value = convert(value)

    this.dep = new Set()
  }

  get value() {
    trackRefValue(this)
    return this._value
  }

  set value(newValue) {
    // 为什么要先修改值再触发更新
    // 因为这里修改的是this._value, 而effect函数修改的也是this._value

    // effect(() => {
    //   calls++
    //   dummy = a.value
    // })

    if (hasChanged(this._rawValue, newValue)) {
      this._rawValue = newValue
      this._value = convert(newValue)
      triggerEffects(this.dep)
    }
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value
}

function trackRefValue(ref) {
  if (isTracking()) {
    trackEffects(ref.dep)
  }
}

export function ref(value) {
  return new RefImpl(value)
}

export function isRef(ref) {
  // 通过判断是否有__v_isRef属性来判断是否是ref
  return !!ref.__v_isRef
}

export function unRef(ref) {
  // 如果是ref对象 -> ref.value
  // reactive -> reactive
  return isRef(ref) ? ref.value : ref
}

export function proxyRefs<T extends object>(objectWithRefs: T) {
  // get set
  return new Proxy(objectWithRefs, {
    get(target, key) {
      // 如果是ref类型的话，就返回.value
      // 如果不是ref类型的话，就返回key对应的value
      return unRef(Reflect.get(target, key))
    },
    set(target, key, value) {
      // 如果修改的属性值是一个ref，而且新值不是一个ref，就修改对应的.value
      // 如果修改的属性值不是一个ref，或者新值是一个ref，就直接覆盖

      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value)
      } else {
        return Reflect.set(target, key, value)
      }
    }
  })
}
