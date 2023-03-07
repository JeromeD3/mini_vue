import { isProxy, isReadonly, readonly } from '../reactive'

describe('readonly', () => {
  it('should make nested values readonly', () => {
    const orginal = { foo: 1, bar: { baz: 2 } }
    const wrapped = readonly(orginal)
    expect(wrapped).not.toBe(orginal)
    
    expect(isReadonly(wrapped)).toBe(true)
    expect(isReadonly(wrapped.bar)).toBe(true)

    expect(isReadonly(orginal)).toBe(false)
    expect(isReadonly(orginal.bar)).toBe(false)
    wrapped.foo = 2
    expect(wrapped.foo).toBe(1)
    // isProxy
    expect(isProxy(wrapped)).toBe(true)
  })

  it('warn then call set', () => {
    console.warn = vi.fn()
    const user = readonly({
      age: 10,
    })
    user.age = 20
    expect(console.warn).toBeCalled()
  })
})
