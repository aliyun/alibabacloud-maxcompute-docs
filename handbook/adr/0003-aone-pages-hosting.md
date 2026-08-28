# ADR 0003：使用 Aone Pages 托管站点

- 状态：已采纳
- 日期：2026-08-28

## 背景

文档平台需要正式站点、分支预览和不进入仓库的托管凭据。Aone CI 提供官方 Aone Pages 模板，可以复用统一的构建和发布能力。

## 决策

使用 Aone CI 流水线 `290625` 和官方模板 `10014197` 发布站点。站点名称为 `maxcompute-docs`，`master` 是正式发布分支，其他分支和合并请求发布预览版本。

正式地址为 `https://maxcompute-docs.io.alibaba-inc.com`。生产构建使用 `DOCS_BASE_URL=/`，通过 `DOCS_SITE_URL` 写入真实站点地址。

## 影响

- Pages 流水线配置由 Aone CI 托管，仓库不复制官方模板 YAML。
- 同一仓库只维护一条 Pages 流水线，避免同一提交重复部署。
- 预览和正式访问地址以部署 Job Summary 为准。
- GitLab CI 继续承担合并门禁，Aone CI 只承担站点构建和发布。
- 修改默认分支、站点名或构建参数时，需要同步更新流水线和本 ADR。
