export const extend = Object.assign

export const isObject = val => {
  return val !== null && typeof val === 'object'
}

export const hasChanged = (value, newValue) => {
  return !Object.is(value, newValue)
}
export const hasOwn = (val, key) =>
  Object.prototype.hasOwnProperty.call(val, key)

// 驼峰化 例如：on-click => onClick  横杠变大写
export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c: string) => (c ? c.toUpperCase() : ''))
}

// 首字母大写
export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const toHandlerKey = (str: string) => {
  return str ? `on${capitalize(str)}` : ``
}

export const pipe = (...fns) => {
  function callback(input, fn) {
    return fn(input)
  }
  return function (param) {
    return fns.reduce(callback, param)
  }
}
