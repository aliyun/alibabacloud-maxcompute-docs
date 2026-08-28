# 文档平台架构

## 目标

平台通过一个 MaxCompute 文档站点提供统一入口、稳定 URL、可复现构建和共同质量门禁，同时让不同产品拥有独立的内容空间、sidebar、维护者和版本演进路径。

## 内容模型

平台初始使用一个默认 docs plugin。公共入门、最佳实践、参考和贡献内容由站点共享；产品内容通过 `docs/products/<product-id>/` 隔离，并由 `sidebars.ts` 为每个产品提供独立 sidebar。

`config/products.json` 是产品登记的单一数据源，首页和文档浏览菜单直接读取或映射该文件。`scripts/validate-products.mjs` 校验登记项、目录、入口页面、Docusaurus 版本一致性和包管理器约束。

一期公开产品空间为：

| 产品 ID      | 展示名称              |
| ------------ | --------------------- |
| `cli`        | MaxCompute CLI        |
| `mcp-server` | MaxCompute MCP Server |
| `desktop`    | MaxCompute Desktop    |

三个产品共享站点外壳、全站搜索、贡献契约、质量门禁和发布流水线。产品差异通过入口页、sidebar 和内容结构表达，不创建三套不同站点界面。

## 稳定性边界

- 产品 ID 和目录使用英文 kebab-case，发布后不因展示名称变化而调整。
- 页面移动、删除或修改 slug 时，需要同时处理重定向和引用。
- 一个页面只归属于一套 sidebar；其他位置通过普通链接复用。
- 产品需要独立历史版本时，保持原 `routeBasePath` 迁移到独立 docs plugin。
- 只有访问控制、独立部署、构建规模或版本生命周期无法继续共享时，才重新评估独立站点。

## 源内容和生成内容

手写内容位于 `docs/`。未来接入自动生成文档时，需要为每类生成内容记录上游仓库、生成命令、版本映射和禁止手工修改的目录。生成结果仍必须通过链接、front matter 和构建校验。

## 质量门禁

合并请求执行格式、Markdown、拼写、文档契约、产品契约、TypeScript 和生产构建检查。产品事实准确性由对应 CODEOWNERS 维护者确认，不能由静态校验替代。
