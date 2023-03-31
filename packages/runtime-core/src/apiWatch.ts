import { ReactiveEffect } from '@jerome778/reactivity'
import { queuePreFlushCb } from './scheduler'

export function watchEffect(source) {
  // 执行依赖函数
  function job() {
    // 如果这里不调用run方法的话，effect就不会执行
    _effect.run()
  }

  let cleanup
  // 一开始这里会执行一次，不会执行cleanup
  // 然后第二次执行的时候，会执行cleanup
  const onCleanup = function (fn) {
    cleanup = _effect.onStop = () => {
      fn()
    }
  }

  // 响应式发生变化后，会执行这个函数
  function getter() {
    if (cleanup) {
      cleanup()
    }
    source(onCleanup)
  }
  // 控制effect的执行
  const _effect = new ReactiveEffect(getter, () => {
    queuePreFlushCb(job)
  })

  // effetct一开始是需要调用一次的
  _effect.run()

  return () => {
    _effect.stop()
  }
}
