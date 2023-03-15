// import { extend } from "@jerome778/shared"
import { extend } from '../../shared/src/index'

let activeEffect: any
let shouldTrack = false

export class ReactiveEffect {
  private _fn: Function
  deps = []
  cleanActive = true // 判断是否需要清理依赖，也就是执行stop
  onStop?: () => void
  constructor(fn: Function, public scheduler?: Function) {
    this._fn = fn
  }
  run() {
    // 为什么this要赋值给activeEffect
    // 因为在执行fn的时候，会执行track，track需要用到activeEffect
    // 所以在执行fn之前，先把this 赋值给activeEffect
    if (!this.cleanActive) return this._fn() // 已经清理过了，就不需要再执行了

    // 不需要清理，而是需要执行收集到的依赖
    shouldTrack = true
    activeEffect = this
    const result = this._fn()

    // 重置
    shouldTrack = false
    return result
  }
  stop() {
    if (this.cleanActive) {
      cleanupEffect(this)
      if (this.onStop) {
        this.onStop()
      }
      this.cleanActive = false
    }
  }
}

function cleanupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect)
  })
  effect.deps.length = 0
}

/**
 * 1. 依赖收集
 */
const targetMap = new Map()
// example
// Map {
//   {age: 10} => Map {
//     age => Set {effect}
// }
export function track(target: any, key: any) {
  // {age: 10} age
  // 用来装依赖
  // target -> key -> dep
  if (!isTracking()) return

  let depsMap = targetMap.get(target)

  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }

  trackEffects(dep)
}

export function trackEffects(dep) {
  //  已经在dep中了
  if (dep.has(activeEffect)) return
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}

export function isTracking() {
  return shouldTrack && activeEffect !== undefined
}

/*
 * 2. 触发更新
 */
export function trigger(target: any, key: any) {
  const depsMap = targetMap.get(target)
  const dep = depsMap.get(key)

  triggerEffects(dep)
}

export function triggerEffects(dep) {
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      // 因为之前已经把this赋值给了activeEffect
      // 所以这里的effect的run方法是之前effect传过来的fn
      effect.run()
    }
  }
}

export function effect(fn: Function, options?: any) {
  // 首先创建一个类，用来存储fn，然后执行传过来的fn
  // fn
  const _effect = new ReactiveEffect(fn, options?.scheduler)
  // extend
  extend(_effect, options)
  _effect.run()
  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

export function stop(runner) {
  runner.effect.stop()
}
