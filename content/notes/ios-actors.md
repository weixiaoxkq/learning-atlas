# actor、@MainActor 与数据隔离

> 待学习课程提纲：本节尚未开始。问题、讲解顺序、练习与验收均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- 多个任务同时修改同一份数据会出什么问题？
- 为什么界面更新必须在 MainActor 上进行？

## 讲解顺序

1. 数据竞争与 actor 的隔离。
2. @MainActor 与界面代码。
3. 跨 actor 调用为什么需要 await，以及 nonisolated 的作用。

## 动手练习

用 actor 实现一个线程安全的缓存。

## 观察与验收

能解释编译器报 actor-isolated 错误的原因。尚未实际完成。

## 备课参考

- [Swift 编程语言：并发](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/)
