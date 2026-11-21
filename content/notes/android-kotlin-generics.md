# 泛型、型变 in／out 与 reified

> 待学习课程提纲：本节尚未开始。问题、讲解顺序、练习与验收均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- 泛型解决了什么重复问题？
- List<out T> 中的 out 是什么意思？

## 讲解顺序

1. 泛型类、泛型函数与上界约束。
2. 声明处型变 in／out 与使用处型变。
3. inline 函数配合 reified 获取类型信息。

## 动手练习

写一个泛型的页面状态类型 UiState<T>。

## 观察与验收

能解释为什么 List<String> 可以赋值给 List<Any>。尚未实际完成。

## 备课参考

- [Kotlin：泛型](https://kotlinlang.org/docs/generics.html)
