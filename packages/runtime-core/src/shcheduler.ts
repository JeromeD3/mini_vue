const queue: any = []

const p = Promise.resolve()
let isFlushPending = false
export function nextTick(fn) {
  return fn ? p.then(fn) : p
}

export function queueJobs(job) {
  if (!queue.includes(job)) {
    queue.push(job)
    console.log('queue', queue)
  }

  queueFlush()
}

// 微任务的时候执行
function queueFlush() {
  if (isFlushPending) return
  isFlushPending = true

  nextTick(flushJobs)
}

function flushJobs() {
  isFlushPending = false
  let job
  while ((job = queue.shift())) {
    job && job()
  }
}

// 思考：视图更新为啥采用异步的方式？
// 1. 为了性能，如果是同步的话，会导致频繁的刷新
// 2. 如果是同步的话，会导致数据更新，但是视图没有更新，导致数据和视图不一致

// 如果是同步的话，会有什么问题？
// 1. 会导致页面频繁的刷新，性能问题
// 2. 会导致数据更新，但是视图没有更新，导致数据和视图不一致
