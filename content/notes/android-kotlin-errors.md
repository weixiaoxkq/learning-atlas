# 异常、Result 与错误建模

> 待学习课程提纲：本节尚未开始。问题、讲解顺序、练习与验收均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- Kotlin 没有受检异常，怎样表达“可能失败”？
- 什么时候用异常，什么时候用 Result 或 sealed 类型？

## 讲解顺序

1. try-catch 作为表达式、finally 与 use。
2. runCatching 与 Result。
3. 用 sealed 类型建模业务错误，并在界面层展示。

## 动手练习

为保存笔记设计“标题为空”“超出长度”两类错误。

## 观察与验收

能决定错误在哪一层捕获、在哪一层展示。尚未实际完成。

## 备课参考

- [Kotlin：异常](https://kotlinlang.org/docs/exceptions.html)
