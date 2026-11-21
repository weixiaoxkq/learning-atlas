# AI 结构化输出与工具调用：@Generable 与 Tool

> 待学习课程提纲：本节尚未开始。问题、讲解顺序、练习与验收均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- 怎样让模型返回程序可以直接使用的结构化数据？
- 模型需要读取 App 数据时，怎样安全地提供工具？

## 讲解顺序

1. 用 @Generable、@Guide 把端侧模型的输出约束为 Swift 类型。
2. 定义 Tool，让模型按需调用 App 内的功能。
3. 校验模型输出并处理失败；云端模型对应使用 JSON Schema 与函数调用。

## 动手练习

让模型为笔记输出“标题、标签数组、待办事项”结构，并直接存入数据库。

## 观察与验收

模型输出不合格时，App 不会崩溃，也不会写入错误数据。尚未实际完成。

## 备课参考

- [Apple：Foundation Models](https://developer.apple.com/documentation/foundationmodels)
