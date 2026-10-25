# Encoder、Decoder 与 Encoder-Decoder

> 从已有聊天提炼的学习笔记；已讲解不等于已掌握。

## 两个判断维度

比较模型时先看信息流和训练目标，不能简单说“Encoder 负责理解、Decoder 只能生成”。

| 架构            | 常见注意力可见性                         | 代表例子   |
| --------------- | ---------------------------------------- | ---------- |
| Encoder-only    | 输入中双向可见                           | BERT       |
| Decoder-only    | 因果可见                                 | GPT、Llama |
| Encoder-Decoder | Encoder 双向，Decoder 因果并读取 Encoder | T5         |

BERT 的经典预训练包含遮蔽语言建模；因果语言模型用前面的 Token 预测后面的 Token。Decoder-only 也能通过组织输入和训练完成分类、抽取与问答。

## Encoder-Decoder 的信息连接

Encoder 编码输入，Decoder 除了读取已生成目标前缀，还通过 [Cross-Attention](topic:ai-cross-attention) 访问输入表示。

## 学习记录

这是可读取聊天中第 06 节的内容，已讲解。没有读取到该节课后题的回答，不能记为完成。原导入记录曾停在本章最后的 [Dense 与 MoE](topic:ai-dense-moe)；本次按用户要求从章首复习，实际停止在 [Cross-Attention](topic:ai-cross-attention) 及 Padding Mask 辨析。

## 来源

- [AI学习路线梳理](https://chatgpt.com/c/6ad375c2-a8ac-83ee-aa53-3388867be8da)（读取到的最近 5 轮；最新讲解为第 06 节）。
- [技术参考](https://arxiv.org/abs/1810.04805)。

## 本次复习：三种结构的数据来源

以下省略残差连接、归一化和多头拆分；Embedding 包含位置信息。每个层、每个 Attention 模块都有各自训练得到的投影参数。

```text
Encoder-only：
输入 → Embedding → [双向 Self-Attention → FFN] × N → 上下文表示 → 任务输出头
                    Q=H W_Q，K=H W_K，V=H W_V
                    H 为本层输入；可屏蔽源 PAD

Decoder-only：
目标前缀 → Embedding → [因果 Self-Attention → FFN] × N → LM Head → 下一个 Token 分数
                        Q、K、V 均由本层输入分别投影
                        因果遮罩阻止关注后续位置

Encoder-Decoder：
源输入 → Embedding → Encoder 层 × N → Encoder 最终输出 H_enc
                                             │
目标前缀 → Embedding → Decoder 层 × N          │
                       每层内部：             │
                       因果 Self-Attention    │
                              ↓               │
                       当前表示 D             │
                              ↓               │
                       Cross-Attention ←──────┘
                       Q=D W_Q；K=H_enc W_K；V=H_enc W_V
                              ↓
                             FFN
                              ↓
                       最后经 LM Head 预测下一个目标 Token
```

Encoder 的双向是可见性，不是把句子正反各读一次。用“我 / 喜欢 / 苹果”作简化 Token 示例，Encoder 中“喜欢”可关注“苹果”；因果 Decoder 中“喜欢”位置不能看见后面的“苹果”，其最终表示可以用于预测下一个 Token。

## 输出头：把表示转换成任务答案

Encoder 输出每位置一个上下文向量。长度 L、隐藏维度 d 时输出为 L×d，尚不是类别或词表预测。

| 任务 | 使用的表示 | 输出 |
| --- | --- | --- |
| 句子情感分类 | BERT 的最终 [CLS] 表示等汇总表示 | 正面、负面等类别分数 |
| 逐 Token 标注 | 每个位置的最终表示 | 人名、地名、其他等标签分数 |
| 遮蔽语言建模 | 被遮位置的最终表示 | 词表各 Token 的分数 |

例如 768 维 [CLS] 表示经 W∈R^(768×2) 和偏置映射为两个分类 logits，再做 Softmax。输出头有需要训练的参数，也可与 Encoder 一起微调。[LM Head](topic:ai-lm-head) 是输出头的一种。

## 三种容易混淆的 Mask

| 名称 | 屏蔽或替换的内容 | 作用 |
| --- | --- | --- |
| Padding mask | 补齐位置对应的注意力分数 | 不从无实际内容的位置读取信息 |
| Causal mask | 后续位置对应的注意力分数 | 不提前读取未来目标 Token |
| BERT 输入 [MASK] | 替换原始输入 Token | 让模型根据上下文预测被遮词 |

使用 mask 不等于只能看前文。Encoder 可以有 padding mask，同时保留有效位置间的双向注意力。[MASK] 是输入内容的替换，不是禁止关注该位置的因果遮罩。

## 为什么需要 PAD，以及怎样使用 Padding Mask

普通批量计算常把不同长度序列补成矩形张量。例如以下按词划分仅为教学示意：

```text
A：我    今天   很     开心
B：我    喜欢   苹果   PAD
C：你好  PAD    PAD    PAD
```

PAD 通常由数据处理程序加入，不是用户原文。先把文本转成 Token ID，再按需要补齐，并生成标记有效位置的 mask。单句且不要求固定长度时通常无需补齐；有些实现也支持不补齐的变长处理。

对句子 B，每个注意力头先照常投影 Q、K、V，再算 S=QKᵀ/√d_k。S 是 4×4：行代表发起关注的 Query，列代表被关注的 Key。Softmax 前加：

```text
M = [0  0  0  -∞
     0  0  0  -∞
     0  0  0  -∞
     0  0  0  -∞]
```

随后逐行计算 A=softmax(S+M)，再 O=AV。第 4 列权重全为 0，不汇总 PAD 的 V。例如分数 [2,1,0,3] 屏蔽后为 [2,1,0,-∞]，Softmax 约为 [0.665,0.245,0.090,0]。

不同句子的 PAD 位置可不同；同一句话的打分矩阵各 Query 行屏蔽相同的 PAD 列。该句的 PAD 位置跨层不变，但每层、每头重新计算 Attention 时仍需使用 mask。

屏蔽 PAD 列并不删除 PAD 行：PAD 作为 Query 仍可能得到输出，后续使用表示时通常忽略这些位置。训练时排除 PAD 标签的损失计算是另一项处理。

## 每层 Attention 打分与最终预测打分

每个 Encoder 层都有 QKᵀ 匹配打分，用于决定怎样汇总 V、更新表示。只有最终输出头才把最终表示转换成类别或词表分数。Padding mask 作用于每层内部的 Attention 打分，二者不能混淆。

## 本次记录范围

本次重新复习并补充结构、输出头和 mask 解释；没有用户明确掌握确认或检查通过证据，不记为已掌握。上述内容来自本次可见对话，不将早期导入聊天重建内容冒充完整历史。
