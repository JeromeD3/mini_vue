import { hasChanged } from '@mini_vue/shared'
import { isTracking, trackEffects, triggerEffects } from './effect'
class RefImpl {
  private _value: any
  // 将effect收集到的依赖存起来
  public dep: Set<unknown>

  constructor(value) {
    this._value = value
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

    if (hasChanged(this._value, newValue)) {
      this._value = newValue
      triggerEffects(this.dep)
    }
  }
}

function trackRefValue(ref) {
  if (isTracking()) {
    trackEffects(ref.dep)
  }
}

export function ref(value) {
  return new RefImpl(value)
}
