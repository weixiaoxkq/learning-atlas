# 逐层 KV Cache 与历史复用

> 从已有聊天提炼的学习笔记；已讲解不等于已掌握。

## 核心概念

KV Cache 按 Transformer 层保存历史位置已经算出的 K、V。下一次 Decode 读取对应层的历史缓存，并加入当前 Token 的 K/V。

## 对历史追问的纠正

不是“从第二个 Token 开始的缓存”，而是在该层注意力规则允许范围内的全部历史。不同层也不共享一套同样的 K/V。

```text
新 Token
  → 第 1 层：新 QKV + 第 1 层历史 KV
  → 第 2 层：新 QKV + 第 2 层历史 KV
  → … → 最终 Hidden State → LM Head
```

## 100 个历史 Token 的例子

常规全注意力 Decode 加入第 101 个 Token 后，某个 head 的 Q 长度为 1，K/V 长度为 101。若每头维度为 128，注意力打分矩阵为 $1\times101$。

## 缓存省掉什么

避免重新计算历史位置的 K/V 与层表示，但当前 Query 仍需与可访问历史交互，因此上下文变长仍会影响计算和缓存内存。

## 边界

滑动窗口只保留窗口内历史，不能把“永久保留全部 Token”当作所有实现的保证。位置与缓存内容见 [下一节点](topic:ai-cache-position-context)。

## 来源

- [AI学习路线梳理](https://chatgpt.com/c/6ad375c2-a8ac-83ee-aa53-3388867be8da)（读取到的最近 5 轮；最新讲解为第 06 节）。
- [技术参考](https://huggingface.co/docs/transformers/cache_explanation)。
