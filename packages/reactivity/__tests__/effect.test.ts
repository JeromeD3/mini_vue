import { effect, stop } from '../src/effect'
import { reactive } from '../src/reactive'

describe('effect', () => {
  it('happly path', () => {
    /**
     * 当user.age发生变化的时候，nextAge也会发生变化
     *
     */
    const user = reactive({
      age: 10,
    })
    let nextAge
    // 当这里触发get操作的时候，会将effect中的fn存储到targetMap中
    // effect函数执行的时候，会先赋值activeEffect，当执行fn的时候，会执行track，track会用到activeEffect
    effect(() => {
      console.log('fn执行')
      nextAge = user.age + 1
    })

    effect(() => {
      console.log('fn执行2')
    })
    // 并不是说，传了effect 他就会收集依赖，而是在执行fn的时候，
    // 会执行track，track会用到activeEffect，这个时候才会收集依赖

    expect(nextAge).toBe(11)
    // update
    // 当这里触发get操作的时候，会将当前effect中的fn存储到targetMap中
    // 此时全局的Map就有两个函数了
    // 执行set的操作的时候，会触发trigger，trigger会遍历targetMap中的fn，然后执行fn
    user.age++
    // 这里的nextAge是在effect中的fn执行的时候，将user.age + 1赋值给nextAge
    // 所以nextAge也会自动增加
    expect(nextAge).toBe(12)
  })

  it('should run the cb once', () => {
    /**
     * effect(fn) -> function(runner) -> fn -> return
     */
    let foo = 10
    const runner = effect(() => {
      foo++
      return 'foo'
    })
    expect(foo).toBe(11)
    expect(runner()).toBe('foo')
    expect(foo).toBe(12)
  })

  it('scheduler', () => {
    // 为了就是让用户自己控制effect何时执行
    // 1. 通过effect的第二个参数给定的一个名为scheduler的fn
    // 2. 当effect 第一次执行的时候，还会执行fn
    // 3. 当响应式对象发生变化的时候，update不回执行fn 而是执行scheduler
    // 4. 当执行runner的时候，会再次的执行fn

    let dummy
    let run: any
    const scheduler = vi.fn(() => {
      run = runner
    })
    const obj = reactive({ foo: 1 })
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      { scheduler }
    )

    // 一开始不会被调用
    expect(scheduler).not.toHaveBeenCalled()
    expect(dummy).toBe(1)

    obj.foo++
    obj.foo++

    // 当响应式对象发生变化的时候，会触发scheduler，而
    expect(scheduler).toHaveBeenCalledTimes(2)
    // should not run yet
    expect(dummy).toBe(1)
    // manually run
    run()
    // should have run
    expect(dummy).toBe(3)
  })

  it('stop', () => {
    let dummy
    const obj = reactive({ prop: 1 })
    const runner = effect(() => {
      dummy = obj.prop
    })
    obj.prop = 2
    expect(dummy).toBe(2)
    stop(runner) // 删除所有收集到的依赖
    // obj.prop = 3
    obj.prop++
    expect(dummy).toBe(2)

    // stopped effect should still be manually callable
    // runner就是effect传入的函数
    runner()
    expect(dummy).toBe(3)
  })

  it('onStop', () => {
    const onStop = vi.fn()
    const runner = effect(() => {}, {
      onStop,
    })

    stop(runner)
    expect(onStop).toHaveBeenCalled()
  })
})
