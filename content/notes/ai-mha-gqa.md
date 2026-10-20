# Multi-Head Attention 与 GQA

> 根据聊天中的后续回顾重建；早期章节原文未完整读取。

## 核心概念

多头注意力让不同 head 在各自的投影空间中计算注意力，再合并结果。不同 head 不是人工指定的“数学头”或“语法头”。

GQA（Grouped-Query Attention）让一组 Query heads 共享一组 Key/Value heads。它减少缓存的 K/V head 数量，影响推理时 KV Cache 的体积。

```text
MHA：多个 Q heads 分别对应各自的 K/V heads
GQA：若干 Q heads 共享一个 K/V head
MQA：所有 Q heads 共享一个 K/V head
```

## 常见误区

GQA 不是让多个 Query 使用同一个注意力分数；Query 仍不同，计算出的权重也可以不同。共享的是 K/V 表示。它和 [MoE](topic:ai-dense-moe) 的稀疏专家路由是两个维度。

## 记录范围

第 06 节回顾中出现 Multi-Head Attention 和 GQA。此笔记为重建概要，没有恢复早期示例或编造练习完成记录。

## 来源

- [AI学习路线梳理](https://chatgpt.com/c/6ad375c2-a8ac-83ee-aa53-3388867be8da)（读取到的最近 5 轮；最新讲解为第 06 节）。
- [技术参考](https://arxiv.org/abs/2305.13245)。
