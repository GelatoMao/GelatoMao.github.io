---
title: "用 Astro + GitHub Pages 搭建个人博客指南"
description: "一步步教你用 Astro 框架和 AstroPaper 主题搭建一个高性能、SEO 友好的个人博客，并部署到 GitHub Pages。"
pubDatetime: 2026-06-13T11:00:00.000Z
tags:
  - Astro
  - 教程
  - 建站
featured: false
---

## Table of contents

## 前言

如果你还在用 Hexo、Jekyll 或 Hugo 等传统方案搭建博客，不妨试试 Astro。它在 2026 年已经成为开发者博客的首选框架，兼具极致性能和优秀的开发体验。

## 技术选型

| 方案 | 优势 | 适合场景 |
|------|------|----------|
| Astro | 零 JS、Islands 架构、框架无关 | 内容优先网站、博客 |
| Next.js | 全栈能力、SSR/SSG 混合 | 需要复杂交互的应用 |
| Hugo | 极快构建速度、Go 模板 | 纯内容站点 |
| VitePress | Vue 生态、文档优先 | 技术文档 |

对于个人博客来说，Astro 是当下最佳选择。

## 快速开始

### 1. 创建项目

```bash
# 使用 AstroPaper 模板
git clone https://github.com/satnaing/astro-paper.git my-blog
cd my-blog
rm -rf .git
pnpm install
```

### 2. 修改配置

编辑 `astro-paper.config.ts`，修改站点信息：

```typescript
export default defineAstroPaperConfig({
  site: {
    url: "https://yourusername.github.io/",
    title: "Your Blog",
    description: "你的博客描述",
    author: "Your Name",
    lang: "zh-CN",
    timezone: "Asia/Shanghai",
  },
  // ...
});
```

### 3. 写文章

在 `src/content/posts/` 目录下创建 Markdown 文件：

```markdown
---
title: "文章标题"
description: "文章描述"
pubDatetime: 2026-06-13T10:00:00.000Z
tags:
  - 标签1
  - 标签2
featured: false
---

正文内容...
```

### 4. 本地预览

```bash
pnpm dev
```

访问 `http://localhost:4321` 查看效果。

## 部署到 GitHub Pages

### 配置 GitHub Actions

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: "11.3.0"
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "pnpm"
      - run: pnpm install --frozen-lockfile
      - run: pnpm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 启用 GitHub Pages

在仓库 Settings > Pages 中，将 Source 设置为 "GitHub Actions"。

## 总结

整个过程非常简单：clone 模板、改配置、写文章、推代码。Astro + GitHub Pages 的组合让你可以零成本拥有一个高性能的个人博客。

Happy blogging! 🎉
