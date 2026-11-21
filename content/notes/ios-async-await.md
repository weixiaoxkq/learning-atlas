# async/await、Task 与结构化并发

> 待学习课程提纲：本节尚未开始。问题、讲解顺序、练习与验收均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- 异步代码为什么需要 async/await，而不是层层嵌套回调？
- Task、async let 与 TaskGroup 分别在什么时候用？

## 讲解顺序

1. async 函数与 await 挂起点。
2. 创建 Task，在同步代码中启动异步工作。
3. async let、TaskGroup 并行执行与结构化并发的生命周期。

## 动手练习

并行读取两份模拟数据，合并结果后显示。

## 观察与验收

能指出一段代码中所有可能挂起的位置。尚未实际完成。

## 备课参考

- [Swift 编程语言：并发](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/)
