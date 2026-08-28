# Aone Pages 部署

## 当前状态

站点由 Aone CI 流水线 `290625` 使用官方 `deploy-aone-pages` 模板（模板 ID `10014197`）发布。GitLab CI 继续负责仓库门禁和静态制品，Aone CI 负责正式版本和预览版本托管。

| 配置项   | 当前值                                         |
| -------- | ---------------------------------------------- |
| 站点名称 | `maxcompute-docs`                              |
| 正式地址 | `https://maxcompute-docs.io.alibaba-inc.com`   |
| 正式分支 | `master`                                       |
| 预览触发 | 其他分支 push、合并请求 opened 或 reopened     |
| Node.js  | Aone Pages 官方 Node.js 22 运行环境            |
| npm      | 构建时安装仓库固定的 npm 11.6.2                |
| 构建命令 | `npm ci --no-audit --no-fund`、`npm run build` |
| 发布目录 | `build/`                                       |

生产构建设置 `DOCS_SITE_URL=https://maxcompute-docs.io.alibaba-inc.com` 和 `DOCS_BASE_URL=/`。

Docusaurus 使用目录式尾斜线 URL，为每条路由生成 `route/index.html`。新增硬编码站内链接时保留末尾 `/`，保证 Aone Pages 可以直接访问深层链接。

## 流水线管理

流水线配置存储在 Aone CI，不在仓库中复制官方模板。修改参数或触发器前先读取流水线 `290625` 的当前配置，并同步更新本手册和 ADR 0003。不得为同一仓库重复创建 Pages 流水线。

`master` 的成功运行发布正式版本。其他分支和合并请求的成功运行只生成预览版本；访问地址以部署 Job Summary 输出为准，不根据运行 ID 拼接。

## 上线后确认

- 站点可见性和访问授权符合文档范围
- 默认分支和 Aone CI 发布权限仅授予维护者
- 静态资源缓存、失效和回滚方式经过演练
- 内容安全策略和其他安全响应头
- 搜索爬虫访问范围
