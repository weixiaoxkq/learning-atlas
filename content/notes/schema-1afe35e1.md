# Schema、结构化结果与程序校验

> 待学习课程提纲：本节尚未开始。案例与实验均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- 合法 JSON 与符合业务要求的数据有什么区别？
- Schema 如何描述字段、类型、必填项和取值限制？
- 格式通过以后，怎样继续检查内容与来源？

## 讲解顺序

1. 为整理结果定义一个最小数据契约，再解释 JSON 与 Schema 的角色。
2. 检查缺字段、错类型、额外字段和空结果等样例。
3. 分开讨论结构校验、业务规则和语义评估，并安排失败结果的处理路径。

## 贯穿案例

草稿包含标题、摘要和来源列表；缺少约定的必填信息时进入修正或待确认分支。

## 可选小实验

用一份小 Schema 检查几份手写样例，再列出 Schema 本身无法判断的两类内容问题。

## 观察与验收

既能找出结构错误，也能说明“格式正确”为什么不足以证明摘要内容可靠。

## 备课参考

- [JSON Schema：从定义到校验](https://json-schema.org/learn/getting-started-step-by-step)
- [Anthropic：Agent 评估工程](https://www.anthropic.com/research/demystifying-evals-for-ai-agents)
