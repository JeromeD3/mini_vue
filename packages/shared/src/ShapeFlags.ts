/**
 * The shape flag for a slot object
 */
// 状态可以通过0和1来表示，但是这里通过位运算来表示，js运算的时候可以提高性能，但是代码可读性不高

// 0000
// 0001 -> element
// 0010 -> stateful_component
// 0100 -> text_children
// 1000 -> array_children

// | 两位都是0，结果就是0，否则就是1
// & 两位都是1，结果就是1，否则就是0

// 修改
// 0001 ｜ 0100 -> 0101
// 这种场景下，就可以通过位运算来修改有某个状态

// 查找
// 0001 & 0001 -> 0001 -> 1
// 0001 & 0010 -> 0000 -> 0
// 这种场景下，就可以通过位运算来查找有某个状态

export enum ShapeFlags {
  ELEMENT = 1, // 二进制 01 -> 1
  STATEFUL_COMPONENT = 1 << 1, // 10 -> 2
  TEXT_CHILDREN = 1 << 2, // 100 -> 4
  ARRAY_CHILDREN = 1 << 3 // 1000 -> 8
}
