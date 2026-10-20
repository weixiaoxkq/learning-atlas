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

这是可读取聊天中第 06 节的内容，已讲解。没有读取到该节课后题的回答，不能记为完成。当前记录位置设在本章最后的 [Dense 与 MoE](topic:ai-dense-moe)。

## 来源

- [AI学习路线梳理](https://chatgpt.com/c/6ad375c2-a8ac-83ee-aa53-3388867be8da)（读取到的最近 5 轮；最新讲解为第 06 节）。
- [技术参考](https://arxiv.org/abs/1810.04805)。
