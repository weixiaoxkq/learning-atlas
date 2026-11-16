# Workflow、Agent、Harness 与应用边界

> 待学习课程提纲：本节尚未开始。案例与实验均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- 单次模型调用、Workflow 和 Agent 怎样划分职责？
- Harness 在系统中负责哪些运行与控制机制？
- 什么任务需要动态决策，什么任务适合预先规定步骤？

## 讲解顺序

1. 从一次生成开始，增加预设步骤，再加入根据工具结果选择下一步的循环。
2. 分别标出模型、流程控制程序、执行环境和任务状态。
3. 讨论不同资料中 Harness 的用法，并用本课程的系统边界保持术语一致。

## 贯穿案例

比较固定的“提取后保存”流程与需要判断是否补充检索的整理任务。

## 可选小实验

为两个任务画流程图，圈出程序预先决定的步骤和运行时需要模型判断的位置。

## 观察与验收

能够依据任务要求选择简单调用、固定工作流或 Agent，并说明相应的控制职责。

## 备课参考

- [Anthropic：Building effective agents](https://www.anthropic.com/research/building-effective-agents)
- [Anthropic：长期任务 Harness](https://www.anthropic.com/research/effective-harnesses-for-long-running-agents)
