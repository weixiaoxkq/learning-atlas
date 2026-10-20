# Causal Mask 与 RoPE

> 根据聊天中的后续回顾重建；早期章节原文未完整读取。

## 两个不同的问题

Causal Mask 决定某位置允许看到哪些 Token；RoPE 在 Q、K 的内积计算中引入位置信息。一个控制可见性，一个表达位置。

因果自注意力中，第 $i$ 个位置只能看不晚于自己的位置。新增 Token 不会反向改变历史位置已经算出的因果表示，这是复用历史 KV 的前提之一。

## RoPE 与缓存

标准 RoPE 路径通常对 Q、K 做旋转，而不直接旋转 V。K Cache 通常保存已应用 RoPE 的 K。后层的 V 仍能包含前层注意力引入的上下文信息。

```text
层输入 → Q 投影 → RoPE
      → K 投影 → RoPE → K Cache
      → V 投影        → V Cache
```

“V 不经过 RoPE”不等于“V 不含上下文”。具体缓存布局或位置处理可能因实现而不同。

## 来源范围

早期章节据回顾重建；关于 K/V 与 RoPE 的纠正来自本次可读取的 KV Cache 追问。详见 [KV 的位置与上下文信息](topic:ai-cache-position-context)。

## 来源

- [AI学习路线梳理](https://chatgpt.com/c/6ad375c2-a8ac-83ee-aa53-3388867be8da)（读取到的最近 5 轮；最新讲解为第 06 节）。
- [技术参考](https://arxiv.org/abs/2104.09864)。
