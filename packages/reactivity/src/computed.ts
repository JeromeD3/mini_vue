import { ReactiveEffect } from './effect'

/**
 * computed执行流程
 * 1. 内部有一个effect，用来收集依赖
 * 2. 而且内部有一个get方法，当调用get方法的时候，会执行effect
 * 3. 如果做到缓存的呢？ 这里用到了dirty变量来标记这个get value有没有调用过
 * 4. 如果dirty为true，就会重新计算，否则就会直接返回缓存的值
 * 5. 当原数值发生改变的时候，会触发trigger，这里会先执行schedule，
 * 6. 然后dirty变成true，开放重新计算
 * 7. 当后续用户调用获取数据的时候，就会调用get方法，此时调用effect，重新计算
 */

class ComputedRefImpl {
  private _getter: any
  private _dirty: boolean = true // 防止重复计算
  private _value: any
  private _effect: ReactiveEffect
  constructor(getter) {
    this._getter = getter
    // 当执行set操作的时候，会先执行schedule
    // getter () => value.foo
    // 传了getter并不会执行
    this._effect = new ReactiveEffect(getter, () => {
      !this._dirty && (this._dirty = true)
    })
  }

  get value() {
    // 当依赖的响应式对象的值发生改变的时候，dirty变成true，重新计算

    if (this._dirty) {
      this._dirty = false
      this._value = this._effect.run()
    }
    return this._value
  }
  set value(newValue) {}
}
export function computed(getter) {
  return new ComputedRefImpl(getter)
}
