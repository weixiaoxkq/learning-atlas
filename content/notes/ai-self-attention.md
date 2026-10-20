# Q、K、V 与 Self-Attention

> 根据聊天中的后续回顾重建；早期章节原文未完整读取。

## 核心概念

在同一层，输入表示 $X$ 分别经过投影得到 $Q=XW_Q$、$K=XW_K$、$V=XW_V$。Query 与 Key 的匹配决定如何汇总 Value。

$$
\operatorname{Attention}(Q,K,V)=\operatorname{softmax}\left(\frac{QK^T}{\sqrt{d_k}}+M\right)V
$$

$M$ 是加性 mask；可见位置加 0，屏蔽位置加负无穷。Self-Attention 的 Q、K、V 来自同一序列在该层的表示。

## 如何理解

Q 表示当前位置用什么特征查询，K 参与相关性打分，V 是被加权汇总的内容。这是理解计算的比喻，不是人为给向量写入“问题、标签、答案”。

## 与推理的联系

[Decode](topic:ai-prefill-decode) 中只需当前位置的 Q，但仍需该层可访问历史的 K、V。加权汇总后还要经过输出投影、残差与其他层内计算，才形成该层输出。

## 记录范围

第 06 节明确回顾此前已讲 QKV；本节点按回顾重建，未取得早期逐段原文。

## 来源

- [AI学习路线梳理](https://chatgpt.com/c/6ad375c2-a8ac-83ee-aa53-3388867be8da)（读取到的最近 5 轮；最新讲解为第 06 节）。
- [技术参考](https://arxiv.org/abs/1706.03762)。
