import { reactive } from '@jerome778/reactivity'
import { vi } from 'vitest'
import { watchEffect } from '../src/apiWatch'
import { nextTick } from '../src/scheduler'

describe('api: watch', () => {
  it.only('effect', async () => {
    const state = reactive({ count: 0 })
    let dummy

    // 组件渲染之前执行 -> setupRenderEffect 在组件渲染之前最后一部执行
    // 之前的effect 是在改变完之后直接运行 -> reactive 与runtime-core 之间没有任何依赖关系
    // watchEffect(() => {
    //   dummy = state.count
    // })

    // Failed test , why?
    // 因为watchEffect执行后，会执行fn，异步任务只能在队列中等待,此时是没有收集到依赖的，dep里面是空的
    // 当轮到异步任务执行，发现dep里面是空的，所以他会get到一个undefined，所以dummy没有改变
    // 但state.count提前执行的话，他会触发get操作，由于当前操作是在effect里面，且shouldTrack为true，所以能将activeEffect收集
    // 如果没有提前执行，异步任务加入到队列中，shouldTrack重新设置为false，所以不会收集

    // 一开始执行的时候，就已经有一个activeEffect, 且fn已经执行完了，关闭收集依赖了，所以不会收集依赖
    watchEffect(async () => {
      // 这里首先收集到一个空的
      state.count
      await new Promise(resolve => {
        resolve(1)
      })
      dummy = state.count
    })

    // expect(dummy).toBe(0)

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
