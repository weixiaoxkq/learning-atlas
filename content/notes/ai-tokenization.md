# Token、Token ID 与 Tokenizer

> 根据聊天中的后续回顾重建；早期章节原文未完整读取。

## 核心概念

Tokenizer 将文本转换为模型词表中的 Token ID。Token 可以是字、词的一部分、符号或字节片段；ID 是离散索引，不是语义向量。

```text
文本 → Tokenizer → Token IDs → Embedding 查表
```

## 需要分清的层次

- Token：分词结果对应的文本单元。
- Token ID：该单元在特定词表中的编号。
- Embedding：用 ID 查询可训练矩阵得到的向量。

不同模型的 Tokenizer 和词表可能不同，同一文本不一定得到相同切分或 ID。不要把“一个汉字等于一个 Token”当作通用规则，也不能用 ID 数值大小判断语义接近。

## 与后续知识的关系

[Embedding](topic:ai-embedding) 将离散 ID 送入连续向量计算；最终的 [LM Head](topic:ai-lm-head) 又把隐藏表示映射回词表空间。

## 记录范围

本节点来自第 05、06 节对前序流程的回顾。早期 Tokenizer 原始讲解未能完整读取，此处是概念重建，不是逐字恢复。

## 来源

- [AI学习路线梳理](https://chatgpt.com/c/6ad375c2-a8ac-83ee-aa53-3388867be8da)（读取到的最近 5 轮；最新讲解为第 06 节）。
- [技术参考](https://huggingface.co/docs/transformers/main_classes/tokenizer)。
