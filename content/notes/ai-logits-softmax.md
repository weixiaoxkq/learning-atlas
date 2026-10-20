# Logits 与 Softmax

> 从已有聊天提炼的学习笔记；已讲解不等于已掌握。

## 核心概念

Logits 是每个候选 Token 的实数分数，不要求非负，也不要求和为 1。Softmax 将它们转换成概率：

$$
p_i=\frac{e^{z_i}}{\sum_j e^{z_j}}
$$

## 示例

若 $z=[3,2,1]$，则概率约为 $[0.6652,0.2447,0.0900]$。数值大小决定相对偏好；给所有 Logits 加同一个常数不改变 Softmax。

实际计算常先减最大值，减少指数溢出的风险。

## 常见误区

概率最高不代表必须选中它。[Sampling](topic:ai-topk-topp) 可以按分布随机选择；Greedy 才是每步选择最大值。这里的概率是模型下一 Token 的分布，不是整段回答“正确的概率”。

## 学习记录

来自原聊天第 05 节，已讲解；没有读取到你完成该节检查题的答案，因此不记录为已掌握。

## 来源

- [AI学习路线梳理](https://chatgpt.com/c/6ad375c2-a8ac-83ee-aa53-3388867be8da)（读取到的最近 5 轮；最新讲解为第 06 节）。
- [技术参考](https://huggingface.co/docs/transformers/main_classes/text_generation)。
