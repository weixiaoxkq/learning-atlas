# 结构化并发：Job、取消与异常传播

> 待学习课程提纲：本节尚未开始。问题、讲解顺序、练习与验收均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- 页面关闭后，协程为什么应该自动取消？
- 子协程出错时会影响哪些协程？

## 讲解顺序

1. Job 层级与父子关系。
2. 协作式取消、isActive 与 withTimeout。
3. 异常传播、CoroutineExceptionHandler 与 SupervisorJob。

## 动手练习

并行请求两份数据，其中一份失败时观察另一份的行为。

## 观察与验收

能设计“部分失败不影响整体”的并行加载。尚未实际完成。

## 备课参考

- [Kotlin：取消与超时](https://kotlinlang.org/docs/cancellation-and-timeouts.html)
- [Kotlin：协程异常处理](https://kotlinlang.org/docs/exception-handling.html)
