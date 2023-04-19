import { h, ref } from '../../lib/guide-mini-vue.esm.js'

// 1. 左侧的对比
// (a b) c
// (a b) d e
// const prevChildren = [
//   h('div', { key: 'a' }, 'A'),
//   h('div', { key: 'b' }, 'B'),
//   h('div', { key: 'c' }, 'C')
// ]
// const nextChildren = [
//   h('div', { key: 'a' }, 'A'),
//   h('div', { key: 'b' }, 'B'),
//   h('div', { key: 'c' }, 'd'),
//   h('div', { key: 'c' }, 'D')
// ]

// 2. 右侧的对比
// a (b c)
// d e (b c)

// const prevChildren = [
//   h('div', { key: 'c' }, 'C'),
//   h('div', { key: 'a' }, 'A'),
//   h('div', { key: 'b' }, 'B')
// ]
// const nextChildren = [
//   h('div', { key: 'd' }, 'd'),
//   h('div', { key: 'c' }, 'c'),
//   h('div', { key: 'a' }, 'A'),
//   h('div', { key: 'b' }, 'B')
// ]

// 3. 新的比老的长  ->  创建新的
// 左侧
//  (a b)
//  (a b) c
// i = 2, e1 = 1,e2 = 2
// const prevChildren = [
//   h('div', { key: 'a' }, 'A'),
//   h('div', { key: 'b' }, 'B')
// ]
// const nextChildren = [
//   h('div', { key: 'a' }, 'A'),
//   h('div', { key: 'b' }, 'B'),
//   h('div', { key: 'c' }, 'c'),
// ]

// 右侧
//  (a b)
// d c (a b)
// const prevChildren = [
//   h('div', { key: 'a' }, 'A'),
//   h('div', { key: 'b' }, 'B')
// ]
// const nextChildren = [
//   h('div', { key: 'c' }, 'c'),
//   h('div', { key: 'd' }, 'd'),
//   h('div', { key: 'a' }, 'A'),
//   h('div', { key: 'b' }, 'B'),
// ]

// 4.老的比新的长 -> 删除老的
// 左侧
// (a b) c
// (a b)
// i = 2, e1 = 2,e2 = 1
// const prevChildren = [
//   h('div', { key: 'a' }, 'A'),
//   h('div', { key: 'b' }, 'B'),
//   h('div', { key: 'c' }, 'C')
// ]
// const nextChildren = [h('div', { key: 'a' }, 'A'), h('div', { key: 'b' }, 'B')]

// 右侧
// a (b c)
// (b c)
// const prevChildren = [
//   h('div', { key: 'a' }, 'A'),
//   h('div', { key: 'b' }, 'B'),
//   h('div', { key: 'c' }, 'C')
// ]

// const nextChildren = [h('div', { key: 'b' }, 'B'), h('div', { key: 'c' }, 'C')]

// 5. 对比中间部分
// 删除老的 -> （在老的里面存在，新的里面不存在）
// a,b,(c,d),f,g
// a,b,(e,c),f,g
// -> d在新节点中是没有的 -> 需要删除
// -> e在老节点中是没有的 -> 需要创建
// c 节点的props也发生了变化
// const prevChildren = [
//   h('div', { key: 'a' }, 'A'),
//   h('div', { key: 'b' }, 'B'),
//   h('div', { key: 'c',id:"pre-c" }, 'C'),
//   h('div', { key: 'd' }, 'D'),
//   h('div', { key: 'f' }, 'F'),
//   h('div', { key: 'g' }, 'G')
// ]
// const nextChildren = [
//   h('div', { key: 'a' }, 'A'),
//   h('div', { key: 'b' }, 'B'),
//   h('div', { key: 'e' }, 'E'),
//   h('div', { key: 'c',id:"next-c" }, 'C'),
//   h('div', { key: 'f' }, 'F'),
//   h('div', { key: 'g' }, 'G')
// ]

// 移动，节点的位置发生了变化
// a,b,(c,d，e),f,g
// a,b,(e,c,d),f,g
// 最长子序列是 【1,2]

// const prevChildren = [
//   h('div', { key: 'a' }, 'A'),
//   h('div', { key: 'b' }, 'B'),
//   h('div', { key: 'c' }, 'C'),
//   h('div', { key: 'd' }, 'D'),
//   h('div', { key: 'e' }, 'E'),
//   h('div', { key: 'f' }, 'F'),
//   h('div', { key: 'g' }, 'G')
// ]
// const nextChildren = [
//   h('div', { key: 'a' }, 'A'),
//   h('div', { key: 'b' }, 'B'),
//   h('div', { key: 'e' }, 'E'),
//   h('div', { key: 'c' }, 'C'),
//   h('div', { key: 'd' }, 'D'),
//   h('div', { key: 'f' }, 'F'),
//   h('div', { key: 'g' }, 'G')
// ]

// 创建新的节点
// a,b,(c,e),f,g
// a,b,(e,c,d),f,g
// d节点在老的节点中不存在，在新的里面存在，所以需要创建
// const prevChildren = [
//   h('div', { key: 'a' }, 'A'),
//   h('div', { key: 'b' }, 'B'),
//   h('div', { key: 'c' }, 'C'),
//   h('div', { key: 'e' }, 'E'),
//   h('div', { key: 'f' }, 'F'),
//   h('div', { key: 'g' }, 'G')
// ]

// const nextChildren = [
//   h('div', { key: 'a' }, 'A'),
//   h('div', { key: 'b' }, 'B'),
//   h('div', { key: 'e' }, 'E'),
//   h('div', { key: 'c' }, 'C'),
//   h('div', { key: 'd' }, 'D'),
//   h('div', { key: 'f' }, 'F'),
//   h('div', { key: 'g' }, 'G')
// ]

// 综合
// 创建y，删除z，移动d,c,e
// a,b,(c,d,e,z),f,g
// a,b,(d,y,c,e),f,g
const prevChildren = [
  // h('div', { key: 'a' }, 'A'),
  // h('div', { key: 'b' }, 'B'),
  h('div', { key: 'c' }, 'C'),
  h('div', { key: 'd' }, 'D'),
  h('div', { key: 'e' }, 'E'),
  h('div', { key: 'z' }, 'Z'),
  // h('div', { key: 'f' }, 'F'),
  // h('div', { key: 'g' }, 'G')
]

const nextChildren = [
  // h('div', { key: 'a' }, 'A'),
  // h('div', { key: 'b' }, 'B'),
  h('div', { key: 'd' }, 'D'),
  h('div', { key: 'y' }, 'Y'),
  h('div', { key: 'c' }, 'C'),
  h('div', { key: 'e' }, 'E'),
  // h('div', { key: 'f' }, 'F'),
  // h('div', { key: 'g' }, 'G')
]

export default {
  name: 'ArrayToArray',
  setup() {
    const isChange = ref(false)
    window.isChange = isChange

    return {
      isChange
    }
  },
  render() {
    const self = this
    return self.isChange === true
      ? h('div', {}, nextChildren)
      : h('div', {}, prevChildren)
  }
}
