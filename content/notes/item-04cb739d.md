# 综合实践：可恢复、可评估的资料整理助手

> 待学习课程提纲：本节尚未开始。案例与实验均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- 怎样把概念、工具、上下文与自动化组合成一个小应用？
- 它怎样证明任务完成，并从中断或错误中恢复？
- 怎样通过同一评估集比较前后版本？

## 讲解顺序

1. 确定一个有边界的资料整理场景，完成输入输出契约和最小可运行流程。
2. 按实际需要接入检索、工具与持久化状态，再演练失败恢复。
3. 运行评估与回归检查，记录任务轨迹、质量、成本和延迟，整理改进依据。

## 贯穿案例

构建可恢复、可评估的资料整理助手：读取约定资料，生成可追溯草稿，经检查后保存结果并记录状态。

## 可选小实验

分阶段交付一个最小版本、一份恢复演练记录和一份版本比较报告；具体语言与工具在实践开始时选择。

## 观察与验收

能按约定输入产出结果；失败可定位、恢复有依据；版本比较使用明确的评估条件。尚未实际构建或运行。

## 备课参考

- [Anthropic：Building effective agents](https://www.anthropic.com/research/building-effective-agents)
- [Anthropic：长期任务 Harness](https://www.anthropic.com/research/effective-harnesses-for-long-running-agents)
- [Anthropic：Agent 评估工程](https://www.anthropic.com/research/demystifying-evals-for-ai-agents)
- [OpenTelemetry：Trace 概念](https://opentelemetry.io/docs/concepts/signals/traces/)
