# 重试、超时、幂等与断点恢复

> 待学习课程提纲：本节尚未开始。案例与实验均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- 超时是否意味着对方没有执行成功？
- 哪些失败适合重试，重试次数与等待怎样控制？
- 幂等和断点记录怎样避免重复动作与丢失进度？

## 讲解顺序

1. 模拟读取失败、格式错误与写入后响应丢失，分别判断下一步。
2. 解释超时、有限重试、退避与幂等标识的作用。
3. 选择需要记录的任务状态，演练中断后继续与结果核对。

## 贯穿案例

草稿可能已保存，但应用没有收到成功响应；设计再次执行时的识别与核对方式。

## 可选小实验

在示意流程中标出三个中断点，逐个说明恢复依据和重复执行可能产生的影响。

## 观察与验收

恢复时能够基于记录和结果核对继续处理，并解释怎样避免同一任务重复写入。

## 备课参考

- [AWS Builders’ Library：超时、重试与退避](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/)
- [AWS Builders’ Library：幂等与安全重试](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)
- [Anthropic：长期任务 Harness](https://www.anthropic.com/research/effective-harnesses-for-long-running-agents)
