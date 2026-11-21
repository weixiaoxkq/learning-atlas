# Flow：冷流、操作符与背压

> 待学习课程提纲：本节尚未开始。问题、讲解顺序、练习与验收均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- Flow 与一次性返回结果的 suspend 函数有什么区别？
- 怎样处理持续变化的数据，例如数据库更新或流式输出？

## 讲解顺序

1. 冷流的创建与收集。
2. map、filter、combine、flatMapLatest、debounce 等操作符。
3. buffer、conflate 与 flowOn 控制背压与线程。

## 动手练习

用 Flow 实现带防抖的笔记搜索。

## 观察与验收

能解释 Flow 在什么时候开始执行。尚未实际完成。

## 备课参考

- [Kotlin：异步 Flow](https://kotlinlang.org/docs/flow.html)
- [Android：Kotlin Flow](https://developer.android.com/kotlin/flow)
