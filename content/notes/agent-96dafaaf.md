# Agent 循环、任务分解与停止条件

> 待学习课程提纲：本节尚未开始。案例与实验均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- Agent 每一轮怎样根据结果决定下一步？
- 任务分解如何与工具反馈结合？
- 怎样判定完成、需要补充信息或应该停止？

## 讲解顺序

1. 画出观察状态、调用模型、执行工具、记录结果的最小循环。
2. 用缺少来源的草稿示例，演示计划随证据变化。
3. 约定完成条件、失败退出和循环预算，并检查无进展循环。

## 贯穿案例

整理助手发现草稿缺少来源后进行补充检索，资料不足时交付明确的缺口说明。

## 可选小实验

手工走过一段包含两次工具调用的示意轨迹，并指出每轮变化了什么。

## 观察与验收

能够凭结果和约定条件判断继续、完成或退出，而非仅凭模型自称完成。

## 备课参考

- [Anthropic：Building effective agents](https://www.anthropic.com/research/building-effective-agents)
- [Anthropic：长期任务 Harness](https://www.anthropic.com/research/effective-harnesses-for-long-running-agents)
