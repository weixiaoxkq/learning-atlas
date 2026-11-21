# 委托：by lazy、属性委托与类委托

> 待学习课程提纲：本节尚未开始。问题、讲解顺序、练习与验收均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- by 关键字在 Kotlin 中做了什么？
- Compose 中的 by remember 为什么能直接读写值？

## 讲解顺序

1. by lazy 延迟初始化。
2. 属性委托的 getValue／setValue 约定与 Delegates.observable。
3. 类委托：用组合代替继承。

## 动手练习

读懂 val viewModel: NoteViewModel by viewModels() 与 var text by remember { mutableStateOf("") }。

## 观察与验收

能说明委托属性被读取时实际调用了什么。尚未实际完成。

## 备课参考

- [Kotlin：委托属性](https://kotlinlang.org/docs/delegated-properties.html)
