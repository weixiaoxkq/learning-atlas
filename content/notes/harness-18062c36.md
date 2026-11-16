# Harness：执行环境、权限与运行预算

> 待学习课程提纲：本节尚未开始。案例与实验均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- Harness 怎样组织模型循环、工具执行和任务状态？
- 环境、权限、预算和结果反馈怎样配合？
- 长任务跨会话继续时需要留下什么可靠记录？

## 讲解顺序

1. 把此前的工具、Agent 循环、状态与恢复机制组合到同一张架构图。
2. 定义执行环境、可用能力、人工介入条件及时间与调用预算。
3. 用长任务示例检查初始化、增量推进、检查结果与恢复交接。

## 贯穿案例

整理多份资料时逐份推进，每次留下当前结果、未完成事项与可复查的执行记录。

## 可选小实验

写一份小型 Harness 设计说明，覆盖输入、运行循环、持久化状态、完成条件和异常出口。

## 观察与验收

能够从一次失败推导出缺少的机制，并指出它应由模型、运行程序还是环境提供。

## 备课参考

- [Anthropic：长期任务 Harness](https://www.anthropic.com/research/effective-harnesses-for-long-running-agents)
- [Anthropic：Building effective agents](https://www.anthropic.com/research/building-effective-agents)
