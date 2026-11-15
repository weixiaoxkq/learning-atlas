# Cross-Attention 的来源与尺寸

> 从已有聊天提炼的学习笔记；已讲解不等于已掌握。

## 核心概念

在典型 Encoder-Decoder 中，Cross-Attention 的 Query 来自 Decoder 侧当前表示，Key 和 Value 来自 Encoder 输出。它与来自同一序列的 Self-Attention 区别在于信息来源。

$$
Q=H_{dec}W_Q,\quad K=H_{enc}W_K,\quad V=H_{enc}W_V
$$

## 原聊天检查题的尺寸整理

输入长度 100、目标长度 20、隐藏维度 512、8 个头，则传统等宽多头实现每头维度为 64：

```text
Q：20 × 64
K：100 × 64
V：100 × 64
QKᵀ：20 × 100
```

这表示每个目标位置分别关注 100 个输入位置。若增量解码每次只有一个新目标位置，对应打分矩阵则为 $1\times100$。

## 学习记录

尺寸整理是此次笔记中的解释，不能当作你已提交的课后题答案。原聊天该题尚未读取到用户作答。

## 来源

- [AI学习路线梳理](https://chatgpt.com/c/6ad375c2-a8ac-83ee-aa53-3388867be8da)（读取到的最近 5 轮；最新讲解为第 06 节）。
- [技术参考](https://arxiv.org/abs/1706.03762)。

## 每个 Decoder 层究竟读取什么

标准 Transformer 的每个 Decoder 层都读取同一份 Encoder 最后一层输出，而不是按层号读取对应的 Encoder 层，也不直接复用 Encoder Self-Attention 内部算好的 K、V。

对第 l 个 Decoder 层的 Cross-Attention：

$$
Q_l=D_lW_{Q,l},\quad K_l=H_{enc,final}W_{K,l},\quad V_l=H_{enc,final}W_{V,l}
$$

D_l 是该层因果 Self-Attention 之后、进入 Cross-Attention 时的表示。各层 Cross-Attention 各自拥有训练得到的投影参数。Encoder 提供投影的输入，Decoder 的 Cross-Attention 负责把它投影成自己的 K、V。

固定源输入推理时，H_enc 不变，各层的 Cross-Attention K、V 可以算一次后缓存，后续生成步骤复用。缓存不代表没有 K、V 投影。

## Self-Attention 与 Cross-Attention 共用的计算

$$
\operatorname{Attention}(Q,K,V)=\operatorname{softmax}\left(\frac{QK^T}{\sqrt{d_k}}+M\right)V
$$

先用 Q 与各 K 匹配，缩放并加 mask，Softmax 得到权重，再加权汇总 V。Self-Attention 的 Q、K、V 由同一序列的本层表示投影；Cross-Attention 的 Q 与 K/V 来自不同序列。同源并不等于 Q、K、V 相同，因为投影矩阵不同。

以英文 I / like / apples、中文前缀“我”为例，Decoder 当前 Query 可以给三个英文位置分配权重。若权重示意为 0.1、0.7、0.2，则提取的信息为 0.1V_I+0.7V_like+0.2V_apples。这些是教学假设数字，不是实际模型测量或逐词对齐保证。

Cross-Attention 输出仍是 Decoder 侧每位置一个向量；后续 FFN 逐位置加工，再进入后续 Decoder 层，最终 LM Head 才输出词表分数。FFN 的典型形式为 σ(xW₁+b₁)W₂+b₂。

## Cross-Attention 中的 Padding Mask

完整源输入在生成前已给定，因此典型翻译模型可关注全部有效源位置，无需以目标位置给源序列加因果三角遮罩。源输入若含 PAD，就在 Softmax 前屏蔽对应源 Key 列。

源长度为 S、目标 Query 长度为 T 时，打分矩阵为 T×S。源 PAD 所在列对所有目标 Query 行都被屏蔽。详细的补齐原因、列屏蔽示例和逐层应用见 [Encoder 与 Padding Mask](topic:ai-model-architectures)。

## 学习位置与记录范围

前次从架构章首复习后曾停在 Cross-Attention 及 Padding Mask 辨析，最后解释了输入为什么要补 PAD。本轮重新讲解 Q/K/V 来源、权重和加权汇总，并继续讨论 MoE、预训练与训练工程。实际停止位置见 [训练工程](topic:ai-training-engineering)。原有尺寸题仍无用户作答证据，没有新增掌握检查或明确掌握确认。

## 单头加权汇总的数值例子

以英文 `I / like / apples` 和中文前缀“我”为例。对某一 Decoder 层的一个头，当前目标位置产生 Query，三个源位置各自产生 Key 和 Value。Query 与各 Key 的缩放点积经 mask 和逐行 Softmax 得到权重，再按这些权重汇总 Value。

| 源位置 | 假设权重 | 假设 Value |
| --- | ---: | --- |
| I | 0.1 | (1, 0) |
| like | 0.7 | (0, 2) |
| apples | 0.2 | (3, 1) |

$$
O=0.1(1,0)+0.7(0,2)+0.2(3,1)=(0.7,1.6)
$$

这些向量和权重是教学假设，不是模型测量，也不保证逐词对齐。一个 Query 对三个源位置分配权重，权重矩阵是 $1\times3$，结果仍然是一个目标侧向量；输出位置数量由 Query 数量决定。

实际多头计算会将各头结果拼接并投影。Cross-Attention 的输出还要经过该层后续计算、后续 Decoder 层，最后才由 LM Head 生成词表分数。

| 模块 | Query 来源 | Key、Value 来源 |
| --- | --- | --- |
| Self-Attention | 当前序列表示 | 同一序列表示 |
| Encoder-Decoder Cross-Attention | Decoder 当前表示 | Encoder 最终输出 |

补充参考：[PyTorch 注意力公式与形状](https://docs.pytorch.org/docs/2.15/generated/torch.nn.functional.scaled_dot_product_attention.html)。
