# 平台变更记录

本文件记录文档平台、主题、构建、依赖和治理能力变化。普通文案修正不需要单独登记平台版本。

## 未发布

- 将内容模型升级为“一个站点 + 多产品文档空间”
- 一期产品范围确定为 MaxCompute CLI、MaxCompute MCP Server 和 MaxCompute Desktop
- 将产品接入目录、注册表、生成命令和协作模板统一为 product 命名
- 增加产品路线图并明确候选产品不得提前进入公开入口
- 保持共享导航、搜索、贡献契约、质量门禁和 Aone Pages 发布流程

## 0.1.0 - 2026-08-28

- 基于 Docusaurus 3.10.2 初始化简体中文文档站点
- 建立单一 docs 实例、多内容域 sidebar 和隔离的文档空间
- 增加内容注册表、JSON Schema、首页入口和契约校验
- 增加贡献指南、文档模板、空间模板、AGENTS.md 和平台手册
- 增加 GitLab CI、CODEOWNERS、Issue 模板和合并请求模板
- 增加格式、Markdown、拼写、front matter、内容契约和生产构建门禁
- 使用 Aone CI 官方模板将 `master` 分支部署到 Aone Pages
- 使用目录式尾斜线路由支持 Aone Pages 深层链接直达
