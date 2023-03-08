import { isReactive, shallowReadonly } from '../src/reactive'

describe('reactivity/shallowReadonly', () => {
  test('should not make non-reactive properties reactive', () => {
    // 这里主要做优化，防止所有的对象都转成响应式对象
    // 与readonly的不同之处在于，shallowReadonly只会对第一层的对象做readonly，而深层次的还可以继续修改
    const props = shallowReadonly({ n: { foo: 1 } })
    props.n.foo = 2
    expect(props.n.foo).toBe(2)
    expect(isReactive(props.n)).toBe(false)
  })

  it('warn then call set', () => {
    console.warn = vi.fn()
    const user = shallowReadonly({
      age: 10
    })
    user.age = 20
    expect(console.warn).toBeCalled()
  })
})
