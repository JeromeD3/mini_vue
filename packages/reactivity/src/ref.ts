import { hasChanged, isObject } from '@mini_vue/shared'
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
