# Prefill 与 Decode 的执行顺序

> 从已有聊天提炼的学习笔记；已讲解不等于已掌握。

## 核心概念

Prefill 处理整段已有输入，生成各层历史 K/V，并利用末位置输出得到第一个生成 Token 的分布。随后 Decode 持续处理新 Token。

```text
输入：我 喜欢 吃
  → Prefill → 预测出 苹果
  → 将 苹果 输入一次 Decode → 预测出 下一个 Token
```

## 最容易混淆的时刻

“苹果被选出来”与“苹果经过模型前向计算”不是同一时刻。刚由 Sampling 选出的 ID 尚未自动成为它自己的 KV Cache；进入下一次前向计算后才产生并追加相应各层 K/V。

## 维度区别

省略 batch/head 维时，处理长度 $n$ 的 Prefill 通常有 $n$ 个 Query 位置；逐 Token Decode 通常只有 1 个新 Query 位置，而 K/V 长度包含可访问的历史和当前位置。

## 适用范围

这里讨论常规逐 Token 因果推理。分块 Prefill、滑动窗口和推测解码会引入额外工程细节。

## 关联

[逐层 KV Cache](topic:ai-kv-cache) · [采样后为什么序列会分叉](topic:ai-generation-randomness)

## 来源

- [AI学习路线梳理](https://chatgpt.com/c/6ad375c2-a8ac-83ee-aa53-3388867be8da)（读取到的最近 5 轮；最新讲解为第 06 节）。
- [技术参考](https://huggingface.co/docs/transformers/cache_explanation)。
