import {
  LifecycleHooks,
  currentInstance,
  setCurrentInstance
} from './component'
import { pauseTrack, resetTracking } from '@jerome778/reactivity/'

function injectHook(
  type: LifecycleHooks,
  hook: Function,
  target: any = currentInstance
) {
  if (target) {
    const hooks = target[type] || (target[type] = [])
    hooks.push(() => {
      // 为啥要暂停依赖收集
      // 在组件创建和更新的过程中，如果响应式数据在这些钩子函数中被修改，那么会触发组件的重新渲染，
      // 这可能会导致死循环。为了避免这种情况的发生，Vue 3 会暂停依赖收集，直到钩子函数执行完毕后再继续依赖收集和更新。

      pauseTrack()
      setCurrentInstance(target)
      hook()
      setCurrentInstance(null)
      resetTracking()
    })
  }
}

export const createHook =
  <T extends Function = () => any>(lifecycle: LifecycleHooks) =>
  (hook: T, target: null = currentInstance) =>
    injectHook(lifecycle, hook, target)

export const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT)
export const onMounted = createHook(LifecycleHooks.MOUNTED)
export const onBeforeUpdate = createHook(LifecycleHooks.BEFORE_UPDATE)
export const onUpdated = createHook(LifecycleHooks.UPDATED)
