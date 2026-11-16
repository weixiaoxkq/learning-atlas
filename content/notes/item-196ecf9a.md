# 模型决策与确定性程序的职责划分

> 待学习课程提纲：本节尚未开始。案例与实验均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- 哪些任务适合模型判断，哪些规则应该由程序执行？
- 模型提出的计划与经过验证的执行结果怎样区分？
- 什么时候需要人工参与或补充信息？

## 讲解顺序

1. 将理解语义、选择候选资料与字段校验、路径限制等职责分别列出。
2. 为一次保存操作划定建议、验证、授权、执行与记录的边界。
3. 检查含糊任务和冲突要求，设计待确认与退出路径。

## 贯穿案例

模型生成文件标题和摘要，程序验证字段与目标位置，约定需确认的变更才进入人工处理。

## 可选小实验

给一组整理步骤分配负责方，并说明如果模型判断错误，哪一层能够发现或限制影响。

## 观察与验收

能把每个执行条件落实到具体负责方，并区分建议、动作与已验证结果。

## 备课参考

- [Anthropic：Building effective agents](https://www.anthropic.com/research/building-effective-agents)
- [JSON Schema：从定义到校验](https://json-schema.org/learn/getting-started-step-by-step)
- [Anthropic：长期任务 Harness](https://www.anthropic.com/research/effective-harnesses-for-long-running-agents)
