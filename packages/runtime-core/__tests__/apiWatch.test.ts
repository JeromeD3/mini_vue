import { reactive } from '@jerome778/reactivity'
import { vi } from 'vitest'
import { watchEffect } from '../src/apiWatch'
import { nextTick } from '../src/scheduler'

describe('api: watch', () => {
  it('effect', async () => {
    const state = reactive({ count: 0 })
    let dummy

    // 组件渲染之前执行 -> setupRenderEffect 在组件渲染之前最后一部执行
    // 之前的effect 是在改变完之后直接运行 -> reactive 与runtime-core 之间没有任何依赖关系
    watchEffect(() => {
      dummy = state.count
    })
    expect(dummy).toBe(0)

    // 响应式改变，watchEffect会在组件渲染之前执行
    state.count++

    // 组件渲染是在promise -> 微任务里面执行的
    await nextTick()
    expect(dummy).toBe(1)
  })

  it('stopping the watcher (effect)', async () => {
    const state = reactive({ count: 0 })
    let dummy
    const stop: any = watchEffect(() => {
      dummy = state.count
    })
    expect(dummy).toBe(0)

    stop()
    state.count++
    await nextTick()
    // should not update
    expect(dummy).toBe(0)
  })

  it('cleanup registration (effect)', async () => {
    const state = reactive({ count: 0 })
    let dummy
    const cleanup = vi.fn()

    const stop: any = watchEffect(onCleanup => {
      // 第一次会先保存cleanup这个函数
      // 第二次会执行cleanup这个函数在执行后续操作
      // 这个函数相当于清除第一次执行的函数而产生的副作用，相当于一个防抖函数
      // 达到永远执行最后一次的效果
      onCleanup(cleanup)

      dummy = state.count
    })
    expect(dummy).toBe(0)

    state.count++
    await nextTick()
    expect(cleanup).toHaveBeenCalledTimes(1)
    expect(dummy).toBe(1)

    stop()
    expect(cleanup).toHaveBeenCalledTimes(2)
  })
})
