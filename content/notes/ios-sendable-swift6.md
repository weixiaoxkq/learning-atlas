# Sendable 与 Swift 6 严格并发检查

> 待学习课程提纲：本节尚未开始。问题、讲解顺序、练习与验收均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- Swift 6 语言模式为什么会出现大量并发报错？
- 什么样的类型可以安全地在并发域之间传递？

## 讲解顺序

1. Sendable 的含义与值类型的天然优势。
2. 严格并发检查、语言模式与默认 actor 隔离等构建设置。
3. 常见报错的修复思路，避免用 @unchecked Sendable 掩盖问题。

## 动手练习

把一段 Swift 5 风格代码迁移到 Swift 6 模式并消除报错。

## 观察与验收

能判断 AI 给出的并发修复是解决了问题，还是只绕过了检查。尚未实际完成。

## 备课参考

- [Swift.org：Swift 6 迁移指南](https://www.swift.org/migration/documentation/migrationguide/)
