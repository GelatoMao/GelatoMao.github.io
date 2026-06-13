---
title: "从零搭建个人博客：踩坑实录与完整指南"
description: "记录我用 Astro + AstroPaper + GitHub Pages 从零搭建博客的全过程，包括框架选型、主题配置、部署踩坑和最终解决方案。"
pubDatetime: 2026-06-13T04:00:00.000Z
tags:
  - Astro
  - GitHub Pages
  - 建站
  - 踩坑
featured: true
---

## Table of contents

## 为什么要重建博客

之前用 Hexo 搭了一个博客，但一直不太满意——主题老旧、构建慢、写作体验也不好。2026 年了，是时候用更现代的方案重新来过。

## 技术选型：为什么选 Astro

调研了一圈主流方案后，最终选择了 **Astro + AstroPaper**：

- **Astro**：2026 年最热门的内容优先静态站点生成器，零 JS 传输、Islands 架构、原生支持 Markdown
- **AstroPaper**：Astro 生态中最受欢迎的博客主题，设计简洁、功能完善、支持暗黑模式和搜索
- **GitHub Pages**：免费托管，推代码自动部署，不需要额外维护服务器

## 搭建过程

### 1. 初始化项目

直接用 AstroPaper 模板创建项目：

```bash
git clone https://github.com/satnaing/astro-paper.git GelatoMao.github.io
cd GelatoMao.github.io
rm -rf .git
git init
pnpm install
```

### 2. 配置站点信息

编辑 `astro-paper.config.ts`，主要改这几项：

```typescript
export default defineAstroPaperConfig({
  site: {
    url: "https://gelatomao.github.io/",
    title: "GelatoMao's Blog",
    description: "前端开发者 / AI Coding 探索者",
    author: "GelatoMao",
    lang: "zh-CN",
    timezone: "Asia/Shanghai",
  },
});
```

### 3. 中文化

AstroPaper 默认是英文界面，需要做中文适配：

- 修改 `astro.config.ts` 中的 `i18n.locales` 为 `["zh-CN"]`
- 创建 `src/i18n/lang/zh-CN.ts` 翻译文件，覆盖所有 UI 文字
- 修改首页 hero 区域的介绍文案

### 4. 配置 GitHub Actions 自动部署

创建 `.github/workflows/deploy.yml`，核心配置：

```yaml
on:
  push:
    branches: [main, master]

jobs:
  build:
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm run build
      - uses: actions/upload-pages-artifact@v3

  deploy:
    needs: build
    environment:
      name: github-pages
    steps:
      - uses: actions/deploy-pages@v4
```

## 踩坑记录

搭建过程中遇到了几个坑，逐一记录。

### 坑 1：HTTPS 推送失败

第一次推送到 GitHub 时，HTTPS 方式认证失败。解决办法是切换到 SSH：

```bash
git remote set-url origin git@github.com:GelatoMao/GelatoMao.github.io.git
```

### 坑 2：页面显示旧内容

推送后网站一直显示旧的 Hexo 内容。原因是 GitHub Pages 的 **Source** 还设置的是 "Deploy from a branch"，需要手动去 Settings → Pages 改成 **"GitHub Actions"**。

### 坑 3：文章不显示

部署成功后首页和文章列表是空的，一篇文章都没有。排查发现是 `pubDatetime` 的问题——AstroPaper 会**过滤掉发布时间在未来的文章**（基于 UTC 时间判断）。

我一开始写的是北京时间，比如 `2026-06-13T10:00:00.000Z`，对于 UTC 来说这个时间还没到，所以被过滤了。

解决办法：确保 `pubDatetime` 是已经过去的 UTC 时间。北京时间减 8 小时 = UTC 时间。

### 坑 4：main 分支部署失败

这是最隐蔽的一个坑。Actions 日志里 Build 步骤全部成功，但 Deploy 步骤总是失败。对比发现：**master 分支部署成功，main 分支部署失败**。

根本原因：GitHub Pages 的 Environment 保护规则（Settings → Environments → github-pages → Deployment branches）里只配置了 `master`，没有包含 `main`。即使 workflow 触发了，Deploy 步骤也会被环境保护规则拒绝。

解决办法两种：

- 方法 A：在 Environment 设置里把 `main` 也加到 Deployment branches
- 方法 B：每次把 main 同步到 master（`git push origin main:master`）

推荐方法 A，一劳永逸。

## 最终效果

经过这些折腾，博客终于跑起来了：

- 首页有个性化介绍和精选文章
- 全中文界面，包括导航、日期格式、页脚
- 支持标签分类、归档、全文搜索
- 暗黑模式切换
- 推代码自动部署，1-2 分钟上线

## 写新文章的流程

现在写文章非常简单：

```bash
# 1. 在 src/content/posts/ 下新建 md 文件
# 2. 填写 frontmatter（标题、描述、时间、标签）
# 3. 用 Markdown 写正文
# 4. 推送
git add .
git commit -m "feat: new post"
git push origin main:master
```

## 总结

整个搭建过程最大的感受是：**框架本身很简单，坑都在部署环节**。Astro 写起来体验很好，AstroPaper 开箱即用，但 GitHub Pages 的各种配置（Source 模式、分支保护、时区问题）如果不注意会浪费很多时间。

希望这篇踩坑记录能帮到同样想搭博客的你。
