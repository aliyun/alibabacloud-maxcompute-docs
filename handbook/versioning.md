# 文档版本策略

## 三类版本

- 站点部署：默认分支内容何时生成并发布静态站点
- 产品文档版本：某产品是否同时保留多个用户可见版本
- 平台版本：Docusaurus、主题、插件和构建流程的版本

三者独立管理。普通文案合并不创建平台版本或 Docusaurus 快照。

## 初始策略

默认 docs plugin 当前没有版本快照，维护者不得对默认实例执行整体版本命令。该命令会复制全部产品内容和 sidebar，不符合产品独立生命周期。Docusaurus 3.10.2 也不允许在尚未创建版本的站点设置 `disableVersioning: true`，因此本策略通过评审规则和本手册约束。

## 迁移为独立实例

产品确实需要同时维护多个公开版本时：

1. 将产品内容移动到独立内容根目录。
2. 从默认 sidebar 中移除该产品。
3. 添加具有稳定 `id` 的 `@docusaurus/plugin-content-docs` 实例。
4. 将 `routeBasePath` 保持为原产品 URL。
5. 在导航项中设置 `docsPluginId`。
6. 验证现有页面、链接和重定向。
7. 为该实例创建版本。

```shell
npm run docusaurus -- docs:version:<plugin-id> <version>
```

版本化前必须明确活跃版本数量、旧版本修复原则、归档时间、维护者和下线方式。
