# 预训练、Next Token Loss 与 Teacher Forcing

> 本轮首次将原来的后续提纲讲解为正式内容；已讲解不等于已掌握。

## 从文本获得监督信号

这里以 Decoder-only 因果语言模型为例。假设文本按教学示意划分为“我 / 喜欢 / 吃 / 苹果”，即可构造：

| 可读取的上下文 | 真实的下一 Token |
| --- | --- |
| 我 | 喜欢 |
| 我、喜欢 | 吃 |
| 我、喜欢、吃 | 苹果 |

省略起止符号，输入与标签错开一个位置：

```text
输入：我    喜欢    吃
标签：喜欢  吃      苹果
```

原文的下一 Token 就提供训练标签，不需要为每句话另写答案。从头预训练时，模型通常从初始化参数开始，通过大量样本学习预测规律。

## Next Token Loss

若真实下一 Token 是“苹果”，模型给它的概率是 $p$，该位置的交叉熵损失为：

$$
L=-\ln p
$$

| 真实 Token 的预测概率 | 损失 |
| ---: | ---: |
| 0.1 | 约 2.303 |
| 0.8 | 约 0.223 |

概率越低，损失越大。实际会汇总多个有效监督位置，并忽略 PAD 或其他不参与监督的标签。常规训练可由 logits 直接计算交叉熵，不需要先采样或取最大概率词，再判定对错。

## 反向传播与参数更新

```text
Token → Embedding → Transformer 层 → LM Head
                                       ↓
                              与真实标签计算 Loss
                                       ↓
                              反向传播计算梯度
                                       ↓
                                优化器更新参数
```

梯度描述参数微小变化对 Loss 的影响。以最简单的梯度下降示意：

$$
\theta_{new}=\theta_{old}-\eta\nabla_\theta L
$$

$\eta$ 是学习率，控制调整幅度。实际优化器可以采用更复杂的更新规则。在全参数训练中，Embedding、Q/K/V 投影、FFN、LM Head 等可训练参数都可以沿计算链路得到梯度并更新。

## Teacher Forcing

训练使用真实前缀。例如，即使模型在“我”后错误预测成“讨厌”，训练它预测“吃”时，条件仍然是原文的“我 / 喜欢”，而非把错误预测接回输入。这种使用真实目标前缀的方式称为 Teacher Forcing。

## 为什么训练能并行，而生成通常逐步进行

| 场景 | 后续输入从哪里来 |
| --- | --- |
| 常规训练 | 数据已经提供全部真实 Token |
| 常规自回归生成 | 先选择新 Token，再接回前缀 |

训练时，每一层可以并行处理多个已知位置，Causal Mask 阻止各位置读取未来信息；层与层之间仍有计算依赖。生成时，后续输入尚未确定，通常逐步选择新 Token。

## 与训练工程及后续方向的关系

如何把样本组成 Batch、累积梯度、使用混合精度并保存训练状态，见 [Batch、Packing、精度与训练状态](topic:ai-training-engineering)。

至此已经讲解了当前入门路线的基础训练与生成闭环。若要继续解释指令跟随聊天助手，后训练中的指令微调和偏好对齐仍是后续方向；该方向未展开，不计入本轮已学内容。

## 学习记录与来源范围

历史导入的第 06 节曾预告预训练，但当时可读取记录没有实际讲解。本条现合并本次聊天中的首次讲解，不能据此把早期预告冒充历史已学内容。分词、概率和维度均为教学示意，没有记录练习完成或掌握检查通过。

## 参考资料

- [历史聊天：AI学习路线梳理](https://chatgpt.com/c/6ad375c2-a8ac-83ee-aa53-3388867be8da)（历史仅读取最近 5 轮，最新为第 06 节；预训练当时只有预告）。
- [Hugging Face：因果语言模型](https://huggingface.co/docs/transformers/tasks/language_modeling)。
- [PyTorch：交叉熵](https://docs.pytorch.org/docs/2.9/generated/torch.nn.CrossEntropyLoss.html)。
- [PyTorch：参数优化](https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html)。
- [PyTorch：Teacher Forcing 说明](https://docs.pytorch.org/tutorials/intermediate/seq2seq_translation_tutorial.html)。
- [Attention Is All You Need](https://arxiv.org/html/1706.03762v7)。
- [后续范围参考：InstructGPT](https://arxiv.org/abs/2203.02155)。
