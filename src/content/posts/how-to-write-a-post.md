---
title: "博客写作指南：如何发布一篇新文章"
description: "详细记录本博客的文章发布流程，包括文件创建、Frontmatter 配置、Markdown 语法、本地预览和部署上线的完整操作说明。"
pubDatetime: 2026-06-13T03:00:00.000Z
tags:
  - 教程
  - 博客
featured: false
---

## Table of contents

## 概述

本博客基于 Astro + AstroPaper 主题构建，写文章的流程非常简单：创建一个 Markdown 文件，填写好元信息，写正文，推送到 GitHub，就自动上线了。

这篇文章把每一步都记录下来，方便以后随时查阅。

## 写作流程总览

整个流程分为四步：

1. 在 `src/content/posts/` 目录新建 `.md` 文件
2. 填写 Frontmatter（文章元信息）
3. 用 Markdown 写正文
4. 推送到 GitHub，自动部署

## 第一步：创建文件

在项目的 `src/content/posts/` 目录下创建一个新的 Markdown 文件。文件名会成为 URL 路径的一部分，建议使用英文小写加短横线命名：

```bash
# 进入项目目录
cd ~/Desktop/GelatoMao.github.io

# 创建新文章文件
touch src/content/posts/my-new-post.md
```

例如文件名为 `my-new-post.md`，最终的访问地址就是 `https://gelatomao.github.io/posts/my-new-post/`。

## 第二步：填写 Frontmatter

每篇文章开头需要用 `---` 包裹的 YAML 格式元信息，这是文章的配置区域：

```markdown
---
title: "文章标题"
description: "文章的简短描述，会显示在列表和 SEO 中"
pubDatetime: 2026-06-13T08:00:00.000Z
modDatetime: 2026-06-14T10:00:00.000Z
tags:
  - 标签1
  - 标签2
featured: false
draft: false
---
```

### 各字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | ✅ | 文章标题 |
| `description` | ✅ | 简短描述，用于列表展示和 SEO |
| `pubDatetime` | ✅ | 发布时间，ISO 8601 格式，必须是过去的时间（UTC） |
| `modDatetime` | ❌ | 最后修改时间，更新文章时添加 |
| `tags` | ❌ | 标签数组，用于分类 |
| `featured` | ❌ | 是否精选，设为 `true` 会显示在首页精选区域 |
| `draft` | ❌ | 是否为草稿，设为 `true` 则不会发布 |
| `ogImage` | ❌ | 自定义社交分享图片路径 |

### 关于时间的注意事项

`pubDatetime` 使用 UTC 时间。由于博客配置了 `Asia/Shanghai` 时区显示，实际展示时会自动 +8 小时。写的时候要注意：

- 北京时间 2026-06-13 16:00 对应 UTC 的 `2026-06-13T08:00:00.000Z`
- **时间必须是过去或当前时刻**，未来时间的文章不会显示

简单算法：北京时间减去 8 小时 = UTC 时间。

## 第三步：编写正文

Frontmatter 下方就是正文区域，使用标准 Markdown 语法书写。

### 常用语法速查

**标题：**

```markdown
## 二级标题
### 三级标题
#### 四级标题
```

**文本样式：**

```markdown
**粗体文字**
*斜体文字*
~~删除线~~
`行内代码`
```

**链接和图片：**

```markdown
[链接文字](https://example.com)
![图片描述](./images/my-image.png)
```

**代码块（指定语言会自动语法高亮）：**

````markdown
```javascript
const greeting = "Hello World";
console.log(greeting);
```
````

**列表：**

```markdown
- 无序列表项
- 另一项

1. 有序列表项
2. 另一项
```

**引用：**

```markdown
> 这是一段引用文字
```

**表格：**

```markdown
| 列1 | 列2 | 列3 |
|------|------|------|
| 内容 | 内容 | 内容 |
```

### 添加目录

如果文章较长，可以在正文开头加一行 `## Table of contents`，会自动生成目录导航：

```markdown
---
title: "我的长文章"
...
---

## Table of contents

## 第一章
正文...

## 第二章
正文...
```

### 使用图片

图片推荐放在 `src/assets/images/` 目录下，然后用相对路径引用：

```markdown
![示意图](../../assets/images/my-diagram.png)
```

也可以直接使用外部图片 URL：

```markdown
![示意图](https://example.com/image.png)
```

## 第四步：本地预览

写完后先在本地预览效果：

```bash
# 启动开发服务器
pnpm dev
```

浏览器访问 `http://localhost:4321`，可以实时看到文章效果。修改文件后会自动热更新。

确认没问题后，`Ctrl+C` 停止开发服务器。

## 第五步：推送发布

```bash
# 添加新文章
git add .

# 提交
git commit -m "feat: add new post - 文章标题"

# 推送到 GitHub
git push
```

推送后 GitHub Actions 会自动触发构建和部署，大约 1-2 分钟后文章就会出现在线上。

可以在仓库的 Actions 页面查看部署进度：`https://github.com/GelatoMao/GelatoMao.github.io/actions`

## 完整示例模板

下面是一个可以直接复制使用的文章模板：

```markdown
---
title: "在这里写标题"
description: "在这里写描述"
pubDatetime: 2026-06-14T08:00:00.000Z
tags:
  - 标签
featured: false
---

## Table of contents

## 开头

在这里写文章的引言部分...

## 正文

主要内容写在这里...

### 小节标题

更细分的内容...

## 总结

总结部分...
```

## 常用操作备忘

### 修改已发布的文章

直接编辑对应的 `.md` 文件，添加 `modDatetime` 字段标记修改时间，然后推送即可。

### 将文章设为草稿

在 Frontmatter 中添加 `draft: true`，文章不会出现在线上，但本地开发时能看到。

### 将文章设为精选

设置 `featured: true`，文章会出现在首页的"精选文章"区域。

### 添加新标签

直接在 `tags` 数组中写新的标签名即可，系统会自动创建对应的标签页面。

### 删除文章

删除 `src/content/posts/` 中对应的 `.md` 文件，推送后线上就会移除。

## 项目目录结构

```
GelatoMao.github.io/
├── src/
│   ├── content/
│   │   ├── posts/          ← 文章放这里
│   │   └── pages/
│   │       └── about.md    ← 关于页面
│   ├── assets/
│   │   └── images/         ← 图片放这里
│   └── ...
├── public/                  ← 静态资源（favicon 等）
├── astro-paper.config.ts    ← 站点配置
└── package.json
```

## 写在最后

写博客最重要的是坚持输出，工具和流程越简单越好。现在只需要打开编辑器、新建一个 Markdown 文件、写完推送，就完成了一篇文章的发布。没有任何多余的步骤。

Happy writing!
