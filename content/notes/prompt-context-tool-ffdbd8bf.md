# Prompt、Context、Tool 与结构化输出

> 待学习课程提纲：本节尚未开始。案例与实验均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- Prompt 与 Context 有什么联系，分别包含哪些信息？
- Tool 是一段指令，还是可以执行的能力？
- 结构化输出解决什么问题，又不能保证什么？

## 讲解顺序

1. 用同一个整理任务分别标出任务指令、原始资料、历史消息和工具说明。
2. 观察自然语言答案、结构化数据和工具调用三种输出的用途。
3. 通过缺少资料与字段错误的例子，确定每种概念解决的工程问题。

## 贯穿案例

把“整理这段资料”拆成任务要求、资料正文，以及预期的标题、摘要和来源字段。

## 可选小实验

将一份示意请求分成指令、数据、工具定义、输出要求四部分，再说明哪些内容会提供给模型。

## 观察与验收

能够区分模型看到了什么、被要求做什么，以及应用怎样消费它的输出。

## 备课参考

- [Anthropic：上下文工程](https://www.anthropic.com/research/effective-context-engineering-for-ai-agents)
- [JSON Schema：从定义到校验](https://json-schema.org/learn/getting-started-step-by-step)
- [Claude 文档：工具调用概览](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)
