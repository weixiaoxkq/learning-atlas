# 采样流程的最小 Python 示例

> 从已有聊天提炼的学习笔记；已讲解不等于已掌握。

## 流程

```text
Logits → 温度缩放 → 候选筛选 → 重新归一化 → 随机选出 ID
```

下面用标准库演示温度、Top-K 和 Top-P 的一次组合。它是本次整理时补充的简化例子，不是历史 PyTorch 代码的原样复制，也没有证据表明你已运行过。

```python
import math
import random


def sample(logits, temperature=1.0, top_k=0, top_p=1.0):
    if not logits or temperature <= 0:
        raise ValueError("需要非空 logits 与正温度")
    if not 0 < top_p <= 1 or top_k < 0:
        raise ValueError("候选筛选参数无效")
    scores = [v / temperature for v in logits]
    ranked = sorted(range(len(scores)), key=scores.__getitem__, reverse=True)
    if top_k:
        ranked = ranked[:top_k]
    weights = [math.exp(scores[i] - scores[ranked[0]]) for i in ranked]
    total = sum(weights)
    kept_ids, kept_weights, cumulative = [], [], 0.0
    for i, weight in zip(ranked, weights):
        kept_ids.append(i)
        kept_weights.append(weight)
        cumulative += weight / total
        if cumulative >= top_p:
            break
    return random.choices(kept_ids, weights=kept_weights, k=1)[0]
```

示例为了说明流程而先做 Top-K、再对保留项计算 Top-P。不能据此假定每个推理引擎的默认处理次序或批量实现相同。

## 边界

这里只选择一个 ID，不运行 Transformer、不维护 KV Cache、不包含完整服务端解码逻辑。

## 来源

- [AI学习路线梳理](https://chatgpt.com/c/6ad375c2-a8ac-83ee-aa53-3388867be8da)（读取到的最近 5 轮；最新讲解为第 06 节）。
- [技术参考](https://huggingface.co/docs/transformers/main_classes/text_generation)。
