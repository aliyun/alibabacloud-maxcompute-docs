# 文档平台架构

## 目标

平台为 MaxCompute 各组件提供统一入口、稳定 URL、可复现构建和共同质量门禁，同时保留组件独立维护内容和版本的能力。

## 内容模型

平台初始使用一个默认 docs plugin。`sidebars.ts` 按开始使用、组件、指南与参考、贡献与平台四个内容域生成侧栏。组件内容通过 `docs/components/<component-id>/` 隔离。

`config/components.json` 是组件登记的单一数据源，首页卡片直接读取该文件。`scripts/validate-components.mjs` 校验登记项、目录、入口页面、Docusaurus 版本一致性和包管理器约束。

## 稳定性边界

- 组件 ID 和目录使用英文 kebab-case，发布后不因展示名称变化而调整。
- 页面移动、删除或修改 slug 时，需要同时处理重定向和引用。
- 一个页面只归属于一套 sidebar；其他位置通过普通链接复用。
- 组件需要独立历史版本时，保持原 `routeBasePath` 迁移到独立 docs plugin。
- 构建规模或发布权限无法继续共享时，重新评估独立站点。

## 源内容和生成内容

手写内容位于 `docs/`。未来接入 API、SDK 或 CLI 自动生成文档时，需要为每类生成内容记录上游仓库、生成命令、版本映射和禁止手工修改的目录。生成结果仍必须通过链接、front matter 和构建校验。

## 质量门禁

合并请求执行格式、Markdown、拼写、文档契约、组件契约、TypeScript 和生产构建检查。产品事实准确性由对应 CODEOWNERS 维护者确认，不能由静态校验替代。
