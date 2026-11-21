# 协程基础：suspend、CoroutineScope 与 Dispatcher

> 待学习课程提纲：本节尚未开始。问题、讲解顺序、练习与验收均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- 协程与线程有什么不同？
- 为什么主线程不能做耗时工作？

## 讲解顺序

1. suspend 函数与挂起。
2. launch、async 与 CoroutineScope。
3. Dispatchers.Main／IO／Default 与 withContext 切换。

## 动手练习

在后台读取模拟数据后，回到主线程更新界面。

## 观察与验收

能指出一段代码在哪个线程上执行。尚未实际完成。

## 备课参考

- [Kotlin：协程基础](https://kotlinlang.org/docs/coroutines-basics.html)
- [Android：Kotlin 协程](https://developer.android.com/kotlin/coroutines)
