# 产品接入契约

新产品接入必须在一个合并请求中完成登记、内容空间、导航和所有权，避免出现无法访问、无法校验或无人维护的页面。

## 接入前提

接入前确认：

- 产品已经进入 [产品路线图](roadmap.md)，并获准创建公开入口
- 稳定且唯一的产品 ID
- 官方展示名称和一句话说明
- 目标读者、核心用户任务和内容范围
- 实际 GitLab 维护组
- 产品事实的权威来源
- 手写、生成或上游同步的内容来源模式
- 版本和支持周期
- 迁移、弃用和归档责任人

仅有产品名称或规划意向不足以创建公开入口。无法确认的信息应保留为空或标记待确认，不得用推测补齐。

## 目录和最低页面

使用生成命令创建产品目录、注册表条目和精确 CODEOWNERS 规则：

```shell
npm run new:product -- \
  --id <product-id> \
  --name "<产品展示名称>" \
  --short-name "<导航短名称>" \
  --description "<首页入口摘要>" \
  --owner <@gitlab-group>
```

可选参数 `--icon <terminal|robot|desktop|cube>` 和 `--accent <orange|blue|violet|green>` 控制注册表支持的展示样式。图标和强调色只用于区分产品入口，不建立独立站点主题。

命令以 `templates/product/` 为模板。最低页面契约包括：

```text
_category_.json
index.mdx
quickstart.mdx
guides.mdx
reference.mdx
troubleshooting.mdx
release-notes.mdx
```

正文可以先保持简短，但每个入口都要明确内容状态。不得提供未经验证的命令、参数、兼容性、权限或产品行为结论。

## 注册表

在 `config/products.json` 中添加：

- `id`：与目录一致的英文 kebab-case
- `name`：官方展示名称
- `shortName`：空间有限时使用的导航短名称
- `description`：用于首页和浏览菜单的一句话说明
- `path`：`docs/products/<product-id>`
- `href`：`/docs/products/<product-id>/`
- `status`：`draft`、`published` 或 `deprecated`
- `owner`：真实 GitLab 用户或组
- `icon` 和 `accent`：从 Schema 允许值中选择的入口样式
- `featured`：是否进入首页推荐入口
- `navigation`：位于当前产品目录内、且有对应页面的常用链接

JSON Schema 为编辑器提供约束，脚本负责跨文件一致性校验。生成命令会写入注册表；接入者仍需检查展示名称、摘要、路径和维护组是否准确。

## 导航和产品边界

- 产品入口必须出现在统一站点的产品浏览菜单中，不新建独立站点外壳。
- 产品首页说明内容范围和推荐阅读路径，不承担产品官网的市场介绍职责。
- 每个产品使用独立 sidebar；跨产品内容放在公共入门、最佳实践或参考目录中。
- 产品官网、控制台和其他站外入口必须使用经过确认的正式地址。

## 所有权和评审

在 `.gitlab/CODEOWNERS` 添加产品目录的精确规则。项目设置中还需保护默认分支、要求合并请求流水线通过，并在当前 GitLab 版本和授权支持时启用 Code Owner approval。

初始兜底维护组不能替代真实产品责任人。产品进入 `published` 状态前，必须确认真实维护者具备项目访问和评审权限。

## 验收

```shell
npm run check:products
npm run ci
```

合并请求中附上首页、产品入口、桌面端菜单和移动端导航截图或静态制品链接，并说明内容来源、版本策略、公开 URL 和实际维护者。
