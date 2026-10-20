# Hidden State → LM Head → Logits

> 从已有聊天提炼的学习笔记；已讲解不等于已掌握。

## 核心概念

对于因果语言模型，用最后一个输入位置的 Hidden State 预测下一个 Token。LM Head 将隐藏空间映射到词表空间，输出 Logits。

## 聊天中的维度练习

已读历史中，你回答了“第 100 个位置、4096 × 50000、得到 50000 个分数”。以行向量约定表示：

$$
H\in\mathbb{R}^{100\times4096},\quad
h_{100}\in\mathbb{R}^{1\times4096}
$$

$$
h_{100}W_{LM}\in\mathbb{R}^{1\times50000},\quad
W_{LM}\in\mathbb{R}^{4096\times50000}
$$

这里 50000 是示例词表大小，不是模型通用常数。实际框架的权重存储可能转置，但线性映射的输入输出尺寸相同。

## 常见误区

Logits 是词表分数，还不是最终文本。需经过 [采样策略](topic:ai-temperature-greedy) 选出 ID，再由 Tokenizer 解码。Hidden State 也不是 [KV Cache](topic:ai-kv-cache)。

## 学习记录

历史中有正确的尺寸回答。保留为已有学习记录；不把助手的夸奖当作对整个模块完成掌握检查的证据。

## 来源

- [AI学习路线梳理](https://chatgpt.com/c/6ad375c2-a8ac-83ee-aa53-3388867be8da)（读取到的最近 5 轮；最新讲解为第 06 节）。
- [技术参考](https://arxiv.org/abs/1706.03762)。
