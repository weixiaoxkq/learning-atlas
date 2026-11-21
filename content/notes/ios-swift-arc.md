# ARC 内存管理：强引用循环、weak 与 unowned

> 待学习课程提纲：本节尚未开始。问题、讲解顺序、练习与验收均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- Swift 在什么时候释放对象？
- 闭包和对象之间为什么会形成循环引用？

## 讲解顺序

1. 引用计数与对象生命周期。
2. 类之间以及闭包中的强引用循环。
3. weak、unowned 与捕获列表的选择。

## 动手练习

故意写出闭包循环引用，用 deinit 打印观察对象未释放，再修复。

## 观察与验收

能在代码审查中识别常见的循环引用写法。尚未实际完成。

## 备课参考

- [Swift 编程语言：自动引用计数](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/automaticreferencecounting/)
