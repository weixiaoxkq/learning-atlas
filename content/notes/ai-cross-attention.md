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
