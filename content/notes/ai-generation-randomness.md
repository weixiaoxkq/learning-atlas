# 生成随机性、序列分叉与停止条件

> 从已有聊天提炼的学习笔记；已讲解不等于已掌握。

## 为什么同一输入可能有不同回答

相同 Prompt 得到相同 Logits 后，随机采样仍可能选中不同 Token。下一次 Decode 的输入随之不同，后续 Hidden State、Logits 以及新增缓存也可能不同。

## Cache 分叉的时间点

首次选择 A 或 B 的瞬间，已处理的 Prompt 缓存仍相同。分别把 A、B 送入下一次 Decode 后，新增位置的 K/V 一般会不同；旧因果前缀的 K/V 仍可相同。

因此不是“采样一发生，全部历史缓存立刻改变”。

## 停止条件

常见条件包括 EOS 或轮次结束标记、最大生成长度、指定停止序列和应用主动终止。聊天结束标记取决于模型与模板，不能假定所有模型都使用同一个字符串。

## 关联

[Prefill 与 Decode](topic:ai-prefill-decode) 说明选出 Token 和将其输入模型的时间区别。

## 来源

- [AI学习路线梳理](https://chatgpt.com/c/6ad375c2-a8ac-83ee-aa53-3388867be8da)（读取到的最近 5 轮；最新讲解为第 06 节）。
- [技术参考](https://huggingface.co/docs/transformers/main_classes/text_generation)。
