# Embedding 与上下文表示

> 根据聊天中的后续回顾重建；早期章节原文未完整读取。

## 核心概念

设词表大小为 $V$，隐藏维度为 $d$，输入嵌入矩阵为 $E\in\mathbb{R}^{V\times d}$。某个 ID 对应 $E$ 的一行。

Embedding 查表产生初始表示。进入多层 Transformer 后，同一 Token 在不同上下文中的 Hidden State 可以不同。

## 一个贯穿后续的尺寸例子

```text
输入：100 个 Token ID
隐藏维度：4096
查表后的表示：100 × 4096
Transformer 输出：100 × 4096（省略 batch 维）
```

隐藏维度 4096 不等于词表大小 50000。前者是内部表示宽度，后者决定 [Logits](topic:ai-logits-softmax) 的候选分数数量。

## 常见误区

初始 Embedding 与最终 Hidden State 不是同一个结果。[KV Cache](topic:ai-kv-cache) 也不保存原始 Embedding。

## 记录范围

根据后续课程流程与维度练习重建；早期原文未完整读取，没有据此补记“已掌握”。

## 来源

- [AI学习路线梳理](https://chatgpt.com/c/6ad375c2-a8ac-83ee-aa53-3388867be8da)（读取到的最近 5 轮；最新讲解为第 06 节）。
- [技术参考](https://arxiv.org/abs/1706.03762)。
