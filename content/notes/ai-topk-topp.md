# Top-K 与 Top-P 的候选筛选

> 从已有聊天提炼的学习笔记；已讲解不等于已掌握。

## 两种筛选方式

Top-K 保留分数最高的 K 个候选；Top-P 按概率降序选取累计概率达到或超过阈值 p 的最小前缀集合，然后对保留项重新归一化。

## 原聊天中的检查例子

```text
A 70%，B 15%，C 10%，D 3%，E 2%
```

- Top-K=3：保留 A、B、C。
- Top-P=0.8：保留 A、B；70% 尚不够，加入 B 后达到 85%。

阈值不要求刚好相等；越过阈值的那个候选通常也要保留。

## 与 Temperature 的关系

Temperature 改变分布，Top-K/Top-P 改变候选集合，Sampling 从最终分布中抽样。组合顺序和最少保留数量等细节取决于实现，不能只凭参数名假定完全一致。

## 学习记录

第 05 节已经讲到这些内容，但可读取历史中没有该检查题的用户作答。此笔记是已讲解内容，不是检查通过记录。

## 来源

- [AI学习路线梳理](https://chatgpt.com/c/6ad375c2-a8ac-83ee-aa53-3388867be8da)（读取到的最近 5 轮；最新讲解为第 06 节）。
- [技术参考](https://huggingface.co/docs/transformers/main_classes/text_generation)。
