# Batch、Packing、精度与训练状态

> 本轮从占位提纲进入实际讲解，并重点追问 Batch 的数量、计算顺序和张量形状。所有小型数值例子均为教学示意。

## Batch、Batch size 与批次数量

| 名称 | 含义 |
| --- | --- |
| 一个 Batch | 一组一起计算的样本，本例中每个样本是一条 Token 序列 |
| Batch size，记作 B | 当前一批中的序列数，或配置的目标批大小 |
| Batch 数量 | 一共有多少组 |

100 条序列、Batch size 为 4，完整遍历一次数据时分成 25 批。B=4 表示一次放入 4 条序列，不是设备最多能处理的数量；可容纳的上限还取决于长度、模型、精度与显存。序列也不必对应自然语言的一句话。

普通单卡、无梯度累积时，批内样本一起计算，批间依次执行：

```text
第1批4条 → 前向 → Loss → 反向 → 更新参数
                                      ↓
第2批4条 → 使用更新后的参数计算 → 再次更新
                                      ↓
……直到第25批
```

25 批并不表示全部同时计算；若把 100 条放入同一次普通 Batch，B 就是 100。这个组织方式也用于 MLP、CNN 等网络，但批间顺序不是 Batch 的强制定义；多卡或流水线训练可以并行或重叠部分计算。

## 输入矩阵：B=2、L=4

以因果语言模型为例，先为每条原始样本错位生成输入与标签，再补齐。以下分词和 ID 都是人为设置：

```text
原文 A：我 / 喜欢 / 吃 / 苹果 / EOS
原文 B：你 / 好 / EOS

ID：PAD=0，我=1，喜欢=2，吃=3，苹果=4，EOS=5，你=6，好=7

输入 I = [[1, 2, 3, 4],
          [6, 7, 0, 0]]

标签 Y = [[2, 3,    4,    5],
          [7, 5, -100, -100]]

有效输入标记 = [[1, 1, 1, 1],
                [1, 1, 0, 0]]
```

EOS 表示结束；标签中的 -100 在本例中表示不参与 Loss。I、Y 和有效输入标记的形状都是 $B\times L=2\times4$。

这里手动完成了输入与标签的错位，仅用于展示原理；GPT-2 等接口可在模型内部错位，使用时应遵循接口约定，避免重复错位。

## Embedding：从二维 ID 到三维表示

假设隐藏维度 D=4、词表大小 C=8，则 Embedding 查找表为 $8\times4$。每个 ID 换成 4 维向量后，输入变成：

$$
X\in\mathbb R^{B\times L\times D}=\mathbb R^{2\times4\times4}
$$

可以看成叠在一起的两个 $4\times4$ 矩阵。例如：

```text
样本 A 的矩阵：              样本 B 的矩阵：
我    [1, 0, 1, 0]          你   [0, 1, 1, 0]
喜欢  [0, 1, 0, 1]          好   [1, 1, 1, 0]
吃    [1, 1, 0, 0]          PAD  [0, 0, 0, 0]
苹果  [0, 0, 1, 1]          PAD  [0, 0, 0, 0]
```

数值没有固定语义解释；这里特意把 PAD 的示意向量设为零，不能据此推断实际模型的 PAD 向量或后续表示一定为零。下面省略位置处理、残差连接和归一化，专门追踪形状。

## Q/K/V 与多头 Attention

以普通等宽多头注意力为例。本层数学记号下 $W_Q,W_K,W_V$ 均为 $4\times4$，则：

$$
Q=XW_Q,\qquad K=XW_K,\qquad V=XW_V
$$

三者形状均为 $2\times4\times4$。两条样本使用同一套本层参数，不为每条样本新增一份模型。

设 H=2 个头、每头维度 d=2，拆分与重排后：

```text
Q/K/V：[B, L, D] = [2, 4, 4]
                   ↓ 拆头并重排
       [B, H, L, d] = [2, 2, 4, 2]
```

对每条样本 b、每个头 h 分别计算：

$$
S_{b,h}=\frac{Q_{b,h}K_{b,h}^{T}}{\sqrt{2}}
$$

单份乘法为 $(4\times2)(2\times4)=4\times4$，所以整个打分张量为 $[B,H,L,L]=[2,2,4,4]$。行是 Query，列是 Key；普通批量 Attention 不会让样本 A 的 Q 匹配样本 B 的 K。

## 因果遮罩与 PAD 列遮罩

下面是“允许读取”的示意，1 为允许、0 为禁止，不是直接相加的 mask 数值：

```text
样本 A，列为：我 喜欢 吃 苹果
[[1, 0, 0, 0],
 [1, 1, 0, 0],
 [1, 1, 1, 0],
 [1, 1, 1, 1]]

样本 B，列为：你 好 PAD PAD
[[1, 0, 0, 0],
 [1, 1, 0, 0],
 [1, 1, 0, 0],
 [1, 1, 0, 0]]
```

真正采用加法 mask 时，允许位置加 0，禁止位置加负无穷，随后逐行 Softmax：

$$
A=\operatorname{softmax}(S+M),\qquad O=AV
$$

PAD 作为 Key 的列被屏蔽，但 PAD 作为 Query 的行仍可能得到输出，其对应预测位置的 Loss 另外忽略。单头输出为 $(4\times4)(4\times2)=4\times2$，整批为 `[2,2,4,2]`；拼接头并投影后回到 `[2,4,4]`。

## FFN、词表输出与 Loss

假设 Dense FFN 把 4 维扩为 8 维，再压回 4 维：

```text
[B,L,4] → [B,L,8] → [B,L,4]
```

最终 LM Head 在数学右乘记号下为 $4\times8$，把每位置表示映射成 8 个词表分数。具体框架的权重存储布局可能转置，但映射的输入输出维度相同。

| 阶段 | 本例形状 |
| --- | --- |
| Token ID | [2, 4] |
| Embedding 与层间表示 | [2, 4, 4] |
| 拆头后的 Q/K/V | [2, 2, 4, 2] |
| Attention 权重 | [2, 2, 4, 4] |
| 合并头后的表示 | [2, 4, 4] |
| 词表 logits | [2, 4, 8] |
| 标签 | [2, 4] |
| 平均 Loss | 一个标量 |

例如零起始索引 `logits[0, 2, :]` 是样本 A 第 3 个输入位置“吃”之后的 8 个候选分数，对应真实标签“苹果”。

计算交叉熵时可以把 logits 摊平为 `[8,8]`、标签摊平为 `[8]`。其中两个 -100 标签忽略，剩余 6 个监督位置的损失取平均：

$$
L_{batch}=\frac{L_{A,1}+L_{A,2}+L_{A,3}+L_{A,4}+L_{B,1}+L_{B,2}}{6}
$$

反向传播汇总这些位置对同一套参数的梯度。Batch 变大通常增加中间激活与计算量，不改变模型参数矩阵的形状。输入的 8 个位置中只有 6 个有效监督目标，也说明输入 Token 数与参与 Loss 的目标数要分别统计。

## 梯度累积与有效 Batch

显存一次只放得下小批数据时，可以先做多次前向与反向，累积梯度，达到设定次数后更新一次参数。

例如每个数据并行副本每次处理 2 条序列、累积 8 次、共 4 个副本，则一次更新利用 $2\times8\times4=64$ 条序列。每条按 2048 个输入 Token 计，共 131072 个输入 Token；有效监督目标仍单独计数。

累积的是梯度，无需同时保留全部小批次的中间计算。对于长度不同、有效目标数不同的序列，应按累积窗口内真正参与监督的 Token 总数正确归一化，不能不加区分地平均各小批 Loss。

## Packing、混合精度与显存

Packing 把短文本组织进较长训练块，减少 PAD 浪费；需明确文档分隔、监督位置和是否允许跨文档关注。

混合精度让适合的操作使用 BF16/FP16，让需要数值稳定性的部分使用 FP32，以减少部分显存与计算开销。它不等于所有训练数据一律采用低精度。

训练显存主要包括权重、梯度、优化器状态和反向传播所需的中间激活等，因此能推理的模型不一定能在相同显存条件下直接训练。

## Checkpoint、验证与 Scaling Law

恢复训练通常需要保存模型权重、优化器状态、学习率调度器状态与更新步数，并按恢复要求保存随机状态、数据读取位置等。训练 Checkpoint 保存训练状态，与推理时复用注意力计算的 KV Cache 职责不同。

训练时也会用未参与参数更新的验证数据观察泛化表现。Scaling Law 研究参数量、训练 Token 数与计算预算对损失及资源分配的经验关系，依赖数据、模型和训练条件，不能保证增加参数就改善每项能力。

## 学习记录与范围

历史导入聊天对本节只有预告。本轮实际讲解了上述工程概念，重点追问了 Batch size 与批次数量，以及张量维度和批间计算顺序。用户表示理解 Batch 的基本组织方式；没有预先约定的检查或明确掌握确认，不记为 completed。

当前正式停止位置保留在本节点，不自动开始下一主题。现有入门路线已经讲到末尾，但后训练中的指令微调与偏好对齐只是后续方向提示，尚未展开学习。

## 参考资料

- [历史聊天：AI学习路线梳理](https://chatgpt.com/c/6ad375c2-a8ac-83ee-aa53-3388867be8da)（历史仅读取最近 5 轮，最新为第 06 节；本节当时只有预告）。
- [GPT-2：输入、标签错位与输出张量形状](https://huggingface.co/docs/transformers/model_doc/gpt2)。
- [PyTorch：Embedding](https://docs.pytorch.org/docs/2.9/generated/torch.nn.Embedding.html)、[Linear](https://docs.pytorch.org/docs/2.9/generated/torch.nn.Linear.html)。
- [PyTorch：注意力计算与张量形状](https://docs.pytorch.org/docs/2.15/generated/torch.nn.functional.scaled_dot_product_attention.html)。
- [PyTorch：交叉熵与忽略标签](https://docs.pytorch.org/docs/2.9/generated/torch.nn.CrossEntropyLoss.html)。
- [Hugging Face：梯度累积与有效 Token 归一化](https://huggingface.co/docs/accelerate/usage_guides/gradient_accumulation)。
- [Hugging Face：因果语言模型的数据分块](https://huggingface.co/docs/transformers/tasks/language_modeling)。
- [PyTorch：混合精度](https://docs.pytorch.org/tutorials/recipes/recipes/amp_recipe.html)、[Checkpoint](https://docs.pytorch.org/tutorials/beginner/saving_loading_models.html)。
- [Training Compute-Optimal Large Language Models](https://arxiv.org/abs/2203.15556)。
