# MCP 的角色、连接与协议边界

> 待学习课程提纲：本节尚未开始。案例与实验均为计划内容，未记录完成或掌握。

## 本节要解决的问题

- MCP 要解决哪一层的连接问题？
- Host、Client、Server 以及工具、资源、提示分别是什么？
- MCP 与模型的工具调用能力、应用权限怎样配合？

## 讲解顺序

1. 先回顾已经理解的工具调用闭环，再把 MCP 放到外部连接的位置。
2. 用文件检索能力说明角色、能力发现和请求响应的关系。
3. 区分协议接通、工具可用与动作被允许三个问题。

## 贯穿案例

为整理助手提供统一的资料检索入口，并比较直接函数调用与经 MCP 连接的示意。

## 可选小实验

绘制 Host、Client、Server 的消息流，指出哪一方提供能力、哪一方执行授权检查。

## 观察与验收

能够说明 MCP 的作用范围，以及接入协议之后应用仍需承担哪些控制责任。

## 备课参考

- [MCP 官方介绍](https://modelcontextprotocol.io/docs/getting-started/intro)
- [MCP 官方架构说明](https://modelcontextprotocol.io/docs/learn/architecture)
