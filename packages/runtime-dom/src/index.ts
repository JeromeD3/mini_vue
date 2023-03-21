import { createRenderer } from '../../runtime-core/src'

function createElement(type) {
  return document.createElement(type)
}

function patchProp(el, key, preVal, nextVal) {
  // 处理on开头的事件
  const isOn = (key: string) => /^on[A-Z]/.test(key)
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase()
    el.addEventListener(event, nextVal)
  } else {
    if (nextVal === undefined || nextVal === null) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, nextVal)
    }
  }
}

function insert(el, parent) {
  parent.appendChild(el)
}

function remove(child) {
  const parent = child.parent
  if (parent) parent.removeChild(child)
}

function setElementText(el, text) {
  el.textContent = text
}

// function setText(el, text) {
  
// }

const render: any = createRenderer({
  createElement,
  patchProp,
  insert,
  remove,
  setElementText,
  // setText
})

export function createApp(...args) {
  return render.createApp(...args)
}

export * from '../../runtime-core/src'
