const queue: any = []
// 保存之前的effect，用于在组件渲染之前执行
const activePreFlushCbs: any = []

const p = Promise.resolve()
let isFlushPending = false
export function nextTick(fn?) {
  return fn ? p.then(fn) : p
}

export function queueJobs(job) {
  if (!queue.includes(job)) {
    queue.push(job)
  }

  queueFlush()
}

// 添加并执行之前收集到的effect
export function queuePreFlushCb(job) {
  activePreFlushCbs.push(job)
  queueFlush()
}

// 微任务的时候执行
function queueFlush() {
  if (isFlushPending) return
  isFlushPending = true

  // 将依赖更新放到微任务里面执行
  nextTick(flushJobs)
}

function flushJobs() {
  isFlushPending = false

  // 调用之前的effect -> 在组件渲染之前执行
  flushPreFlushCbs()

  // component render / update
  let job
  while ((job = queue.shift())) {
    job && job()
  }
}

function flushPreFlushCbs() {
  for (let i = 0; i < activePreFlushCbs.length; i++) {
    activePreFlushCbs[i]()
  }
}
// 思考：视图更新为啥采用异步的方式？
// 1. 为了性能，如果是同步的话，会导致频繁的刷新
// 2. 如果是同步的话，会导致数据更新，但是视图没有更新，导致数据和视图不一致

// 如果是同步的话，会有什么问题？
// 1. 会导致页面频繁的刷新，性能问题
// 2. 会导致数据更新，但是视图没有更新，导致数据和视图不一致
// 3. 这里会等到所有数据更新完之后，再去更新视图，
//  如果数据更新的过程中，有一些数据是需要依赖其他数据的。
// 那么这个时候，就会导致数据更新的顺序不一致，导致数据和视图不一致
