# 贡献指南

本指南适用于文档内容、产品接入和文档平台代码变更。所有变更通过 GitLab 合并请求进入默认分支。

## 选择贡献类型

| 类型       | 典型范围                             | 提交要求                             |
| ---------- | ------------------------------------ | ------------------------------------ |
| 文档内容   | 修正文案、补充步骤、更新示例         | 说明事实来源和本地验证结果           |
| 新产品接入 | 新增产品空间、导航和首页入口         | 同时更新注册表、所有权和最低可用页面 |
| 平台变更   | 主题、构建、依赖、脚本、CI、导航规则 | 说明兼容性、风险和生产构建结果       |

错别字和链接修复可以直接创建合并请求。新增产品、改变公开 URL、引入依赖或调整版本策略前，应先通过 Issue 记录范围与迁移方案。

## 开始贡献

1. 从默认分支创建短生命周期分支。
2. 安装锁文件中的依赖。
3. 完成变更并在本地预览。
4. 运行完整校验。
5. 使用对应的合并请求模板提交变更。

```shell
npm ci
npm start
npm run ci
```

## 内容放置规则

- 跨产品入门内容放在 `docs/getting-started/`。
- 产品内容放在 `docs/products/<product-id>/`。
- 跨产品最佳实践放在 `docs/best-practices/`。
- 公共术语和参考信息放在 `docs/reference/`。
- 贡献流程放在根目录 `CONTRIBUTING.md` 和 `handbook/`，不混入面向用户的产品文档。
- 平台维护决策放在 `handbook/`，不要混入用户内容。

`<product-id>` 使用稳定的英文 kebab-case。一期使用 `cli`、`mcp-server` 和 `desktop`。展示名称放在 `_category_.json`、front matter 和产品注册表中。目录名一旦发布，不因中文名称或品牌文案调整而改变。

## Front matter

每篇 `docs/` 下的 Markdown 或 MDX 文档必须包含：

```yaml
---
title: 页面标题
description: 用一句话说明页面帮助读者完成什么。
product: platform
doc_type: overview
status: draft
tags:
  - maxcompute
---
```

字段约束：

- `product` 必须是 `config/products.json` 中登记的 ID，或公共内容使用的 `platform`。
- `doc_type` 只能使用 `overview`、`quickstart`、`concept`、`how-to`、`tutorial`、`reference`、`troubleshooting`、`release-note`、`governance`。
- `status` 只能使用 `draft`、`published`、`deprecated`。
- 标题层级不超过四级且不跳级。页面内 H1 由 front matter 的 `title` 生成，正文从 H2 开始。
- 已发布页面如需移动或修改 `slug`，必须同时配置重定向或提交迁移说明。

## 内容质量与安全

- 只写可以验证的产品行为。无法确认的内容保留页面骨架，并明确标注内容状态。
- 命令、SQL 和代码块必须标注语言，示例应可以运行。
- AccessKey、令牌、客户数据、真实账号、内部地址和个人信息不得进入仓库。
- 使用 `<accessKeyId>`、`<endpoint>`、`<project_name>` 等规范占位符。
- MDX 中的 JSX、原始 HTML、脚本和第三方嵌入按代码变更审查。
- 图片放在对应产品的 `assets/` 目录，提交前清除账号、书签栏、内部地址和客户信息。
- 不提交构建结果、依赖目录和本地环境文件。

可从 `templates/` 复制与文档类型匹配的模板。模板中的说明文本用于写作提示，提交正文时应删除不适用的部分。

## 接入新产品

新产品必须一次性提交以下内容：

1. `config/products.json` 中的唯一登记项。
2. `docs/products/<product-id>/` 目录和 `_category_.json`。
3. 概览、快速开始、操作指南、参考、故障排查和版本说明入口。
4. 首页产品入口和导航可达性。
5. `.gitlab/CODEOWNERS` 中的真实维护者。
6. 内容来源、版本策略和下线责任人。

优先使用 `npm run new:product -- ...` 同步生成目录、注册表和 CODEOWNERS 规则。完整参数和验收流程见 [handbook/product-onboarding.md](handbook/product-onboarding.md)。

一期之外的产品必须先进入 [handbook/roadmap.md](handbook/roadmap.md) 并完成范围、维护者和内容来源评审。仅列入路线图不代表可以创建公开路由或导航入口。

## 合并请求验收

合并请求描述中应包含：

- 目标读者和变更目的
- 受影响的产品与 URL
- 产品事实来源或确认方式
- 本地执行的校验命令及结果
- 页面截图或 CI 生成的站点制品
- URL、导航、版本、依赖和安全影响

流水线通过只证明仓库契约和静态构建通过。涉及产品能力的内容仍需要对应产品维护者确认。
