# MaxCompute 文档平台

本仓库托管 MaxCompute 的统一文档站点。站点基于 Docusaurus 3.10.2，默认使用简体中文，通过一套站点外壳承载多个产品文档空间，并为产品独立导航、后续版本化和国际化保留扩展路径。

当前阶段交付平台骨架与贡献契约。产品页面允许先提供入口和目录，再由对应维护者补充经过验证的内容。

## 一期产品

- MaxCompute CLI（`cli`）
- MaxCompute MCP Server（`mcp-server`）
- MaxCompute Desktop（`desktop`）

后续候选范围只记录在 [handbook/roadmap.md](handbook/roadmap.md)，未完成接入评审前不创建公开入口。

## 环境要求

- Node.js 20.17.0 或更高版本。团队和 CI 固定使用 Node.js 24.12.0。
- npm 11 或更高版本。仓库只接受 `package-lock.json`，不混用其他包管理器。

## 本地运行

```shell
npm ci
npm start
```

浏览器访问 `http://localhost:3000`。提交前运行完整校验：

```shell
npm run ci
```

常用命令如下：

| 命令               | 用途                                                     |
| ------------------ | -------------------------------------------------------- |
| `npm start`        | 启动本地开发服务器                                       |
| `npm run validate` | 检查格式、Markdown、拼写、front matter、产品注册表和类型 |
| `npm run build`    | 生成生产静态站点到 `build/`                              |
| `npm run serve`    | 本地预览 `build/`                                        |
| `npm run format`   | 自动格式化仓库中的文本文件                               |

## 仓库结构

```text
docs/                 用户站点内容
  products/           按稳定产品 ID 隔离的产品文档空间
config/               产品注册表及其 JSON Schema
templates/            可复制的文档与产品模板，不会发布到站点
handbook/             平台维护、接入、版本和部署决策
src/                  首页、产品入口和主题样式
scripts/              文档与产品契约校验
.gitlab/              CODEOWNERS、Issue 和 MR 模板
```

## 贡献入口

- 修改现有页面：阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 的文档变更流程。
- 接入新产品：按照 [handbook/product-onboarding.md](handbook/product-onboarding.md) 同时提交注册表、目录、所有权和最低可用页面。
- 修改平台代码或 CI：先阅读 [handbook/architecture.md](handbook/architecture.md) 和根目录 [AGENTS.md](AGENTS.md)。

产品文档的事实必须能回溯到产品代码、设计说明、已发布文档或责任人确认。不要填写未经验证的命令参数、地域支持、权限、错误码或性能数据。

## 构建与发布

GitLab CI 会在合并请求和分支流水线中执行完整校验，并保存 `build/` 静态站点制品。Aone CI 流水线 `290625` 使用官方 Aone Pages 模板发布站点：`master` 分支发布到 [maxcompute-docs.io.alibaba-inc.com](https://maxcompute-docs.io.alibaba-inc.com)，其他分支和合并请求生成预览版本。配置和维护方式见 [handbook/deployment.md](handbook/deployment.md)。

## 技术基线

- Docusaurus：3.10.2
- 内容架构：一个站点、一个默认 docs plugin、多个产品文档空间和 sidebar
- 默认语言：简体中文
- 文档版本化：初始化阶段不启用；仅在产品确实需要独立维护多个版本时迁移
- 搜索：预留 Algolia DocSearch 配置，索引和访问参数就绪后启用
