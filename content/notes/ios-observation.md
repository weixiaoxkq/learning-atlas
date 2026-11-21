# Observation：@Observable、@Bindable 与 @Environment

> 待学习课程提纲：本节尚未开始。问题、讲解顺序、练习与验收均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- 多个页面共享的数据应该放在哪里？
- @Observable 怎样做到只刷新用到该属性的视图？

## 讲解顺序

1. 用 @Observable 定义可观察的模型类。
2. 用 @State 持有模型，用 @Bindable 生成绑定。
3. 用 @Environment 在视图树中注入共享对象，并能读懂旧的 ObservableObject 写法。

## 动手练习

把笔记数据移入 @Observable 的 NoteStore，在多个页面共享。

## 观察与验收

能把 ObservableObject／@Published 的旧写法迁移到 @Observable。尚未实际完成。

## 备课参考

- [Apple：Observation](https://developer.apple.com/documentation/observation)
- [Apple：从 ObservableObject 迁移到 @Observable](https://developer.apple.com/documentation/swiftui/migrating-from-the-observable-object-protocol-to-the-observable-macro)
