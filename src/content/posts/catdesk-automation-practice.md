---
title: "CatDesk Automation 实践：定时任务配置与调试踩坑记录"
description: "记录使用 CatDesk Automation 配置每日自动博客发布任务的过程，包括 RRULE 时区问题、执行失败排查、以及自动化任务调试的实用技巧。"
pubDatetime: 2026-06-24T01:00:00.000Z
tags:
  - CatDesk
  - 自动化
  - 学习笔记
  - 效率工具
featured: false
---

## Table of contents

## 背景：让 AI 帮我每天写博客

最近在用 CatDesk 学习后端知识，每次和 AI 的技术讨论里其实都沉淀了不少知识点。但每次手动整理成博客文章还是挺费时间的，所以想到用 CatDesk 的 Automation 功能——配一个定时任务，每天自动扫描当天的学习会话，提炼出有价值的内容，整理成博客文章并推送到 GitHub Pages。

整个思路很简单：定时触发 → 扫描会话列表 → 筛选有技术学习价值的会话 → 调用 blog-publisher skill 生成文章 → git push 发布。但实际配置过程中踩了几个坑，值得记录下来。

## CatDesk Automation 基础

CatDesk 的 Automation 本质上是一个基于 RRULE（RFC 5545 循环规则）的定时任务调度系统。每个 automation 包含几个核心要素：

**prompt** 是任务执行时的指令，就像你在对话中给 AI 发的消息一样，automation 触发时会自动创建一个新会话并执行这个 prompt。

**rrule** 定义执行周期，遵循 iCal 的 RRULE 格式。常用的比如 `RRULE:FREQ=WEEKLY;BYHOUR=9;BYMINUTE=0;BYDAY=MO,TU,WE,TH,FR,SA,SU` 表示每天 9:00 执行。注意这里虽然用了 `FREQ=WEEKLY`，但通过 `BYDAY` 指定了一周七天，效果等同于每天执行。

**projectPath / workspacePaths** 指定任务关联的工作区，这决定了任务执行时的上下文环境（比如能访问哪些 skill）。

管理 automation 的方式是通过 `catdesk automation` CLI：

```bash
# 查看所有任务
catdesk automation list

# 查看单个任务详情
catdesk automation get --id <id>

# 创建任务
catdesk automation create --name "任务名" --prompt "执行指令" --rrule "RRULE:..."

# 更新任务
catdesk automation update --id <id> --rrule "RRULE:..." --prompt "新指令"
```

## 踩坑一：RRULE 的时区问题

这是最容易犯的错误。我一开始想设置每天晚上 8 点执行，于是按 UTC 时区换算：北京时间 20:00 = UTC 12:00，设置了 `BYHOUR=12`。这个是正确的。

但后来想改成早上 9 点执行时，我习惯性地又做了一次 UTC 换算：北京时间 9:00 = UTC 1:00，设置了 `BYHOUR=1`。结果早上 9 点任务没有触发，通过查看 `nextRunAt` 时间戳才发现问题——下次执行时间是凌晨 1:00 CST。

原来 CatDesk 的 RRULE **是按本地时间（CST）解析的**，不需要手动换算 UTC。第一次设置 `BYHOUR=12` 之所以"看起来对"，是因为中午 12 点恰好也是一个合理的时间，但实际上任务是在北京时间 12:00 而不是 20:00 触发的。

正确做法很简单：**BYHOUR 直接写本地时间的小时数**。想要早上 9 点执行就写 `BYHOUR=9`，想要晚上 8 点执行就写 `BYHOUR=20`。

验证方法是查看 automation 的 `nextRunAt` 字段（毫秒级 Unix 时间戳），转换成本地时间确认是否符合预期：

```bash
# macOS 下把时间戳转为可读时间
date -r $(echo "1782349200000/1000" | bc)
# 输出: Thu Jun 25 09:00:00 CST 2026  ✓
```

## 踩坑二：执行失败的排查

任务配好后第一次触发，状态显示 `runStatus: "failed"`。怎么排查？

首先通过 `catdesk automation get --id <id>` 查看任务详情，关注几个关键字段：

`lastRunAt` 告诉你任务最后一次执行的时间，`runCount` 是执行次数，`lastSessionId` 是执行时创建的会话 ID，`runStatus` 是执行结果。

拿到 `lastSessionId` 后可以用 `catdesk query messages -c <conversationId>` 查看那次执行的完整对话内容，这样就能知道具体是哪一步出了问题。

在我的案例中，消息内容为空，而 automation 目录下的 `memory.md` 记录了 `UI SDK automation failed`。这说明任务在会话真正开始之前就失败了，通常是因为 CatDesk 客户端当时不在前台运行、网络连接中断、或者 SDK 初始化失败等环境问题。

关键排查路径总结如下：`catdesk automation get` 获取状态 → `catdesk query messages` 查看执行日志 → 检查 `~/.catpaw/desk/automations/<id>/memory.md` 查看简要失败记录。

## 任务设计：总结前一天 vs 当天的会话

定时任务的执行时间决定了它应该总结哪一天的内容。如果设置在晚上 8 点执行，那么总结"当天"的会话是合理的，因为一天的工作基本结束了。但如果改成早上 9 点执行，就应该总结"前一天"的会话，否则早上 9 点当天还没有什么学习内容。

这个逻辑变更需要同步修改 prompt 中的筛选条件。我的 prompt 中让 AI 用 `catdesk session list` 获取会话列表，然后根据时间戳筛选。时间戳是毫秒级的 Unix 时间戳，需要转换为北京时间（UTC+8）后判断日期。改成总结前一天时，只需要把"等于今天日期"改成"等于昨天日期"即可。

另外还有一个细节：需要在 prompt 中明确排除 automation 自身的会话，不然任务每次执行都会看到自己上一次的执行记录，可能造成干扰。

## 实用调试技巧

在配置和调试 automation 的过程中，总结了几个实用技巧：

**先手动跑一遍流程**。在正式配置定时任务之前，按照 prompt 中的步骤手动执行一遍，确认每个环节都能跑通。比如 `catdesk session list` 的输出格式、时间戳的筛选逻辑、skill 的调用方式等。

**用 `date` 命令确认时间**。不要凭感觉判断时间，尤其是涉及时区换算时。系统时间用 `date` 查，时间戳转换用 `date -r` 查。

**检查 nextRunAt 确认调度是否正确**。每次修改 RRULE 后，都检查一下 `nextRunAt` 转换出来的时间是否符合预期，不要等到"时间到了没触发"才发现配错了。

**保持客户端运行**。CatDesk Automation 需要客户端在前台运行才能正常触发，如果电脑休眠或客户端关闭了，任务就无法执行。

## 小结

CatDesk Automation 是一个挺实用的功能，适合把重复性的任务自动化。配置的核心就是写好 RRULE 和 prompt，但实际使用中时区问题和执行环境是最容易踩坑的地方。记住 RRULE 的 BYHOUR 是本地时间、确保客户端保持运行、善用 CLI 工具排查问题，基本上就能稳定跑起来了。
