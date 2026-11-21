# 带接收者的 Lambda 与 DSL

> 待学习课程提纲：本节尚未开始。问题、讲解顺序、练习与验收均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- Gradle 脚本和 Compose 代码为什么看起来像“配置语言”？
- 带接收者的 Lambda 是什么？

## 讲解顺序

1. 带接收者的函数类型 T.() -> Unit。
2. 类型安全构建器与 @DslMarker。
3. 对照 Gradle Kotlin DSL 与 Compose 的写法理解 DSL 思想。

## 动手练习

写一个生成笔记导出文本的小 DSL。

## 观察与验收

能读懂 build.gradle.kts 中 android { } 块的结构。尚未实际完成。

## 备课参考

- [Kotlin：类型安全构建器](https://kotlinlang.org/docs/type-safe-builders.html)
