# 组件接入契约

新组件接入必须在一个合并请求中完成登记、内容、导航和所有权，避免出现无法访问或无人维护的页面。

## 接入信息

接入前确认：

- 稳定且唯一的组件 ID
- 官方展示名称和一句话说明
- 目标读者和内容范围
- 实际 GitLab 维护组
- 产品事实的权威来源
- 手写、生成或上游同步的内容来源模式
- 版本和支持周期
- 迁移、弃用和归档责任人

## 目录和最低页面

使用生成命令创建组件目录、注册表条目和精确 CODEOWNERS 规则：

```shell
npm run new:component -- \
  --id <component-id> \
  --name "<组件展示名称>" \
  --description "<首页卡片摘要>" \
  --category <core|development|integration|operations> \
  --owner <@gitlab-group>
```

命令以 `templates/component/` 为模板。最低页面契约包括：

```text
_category_.json
index.mdx
quickstart.mdx
concepts.mdx
guides.mdx
reference.mdx
troubleshooting.mdx
release-notes.mdx
```

正文可以先保持简短，但每个入口都要明确内容状态，不能提供未经验证的命令、参数或兼容性结论。

## 注册表

在 `config/components.json` 中添加：

- `id`：与目录一致的英文 kebab-case
- `name`：官方展示名称
- `description`：用于首页卡片的一句话说明
- `path`：`docs/components/<component-id>`
- `href`：`/docs/components/<component-id>`
- `category`：受控分类
- `status`：`draft`、`published` 或 `deprecated`
- `owner`：真实 GitLab 用户或组

JSON Schema 为编辑器提供约束，脚本负责跨文件一致性校验。

生成命令会写入注册表。接入者仍需检查展示名称、摘要、分类和维护组是否准确。

## 所有权和评审

在 `.gitlab/CODEOWNERS` 添加组件目录的精确规则。项目设置中还需保护默认分支、要求合并请求流水线通过，并在当前 GitLab 版本和授权支持时启用 Code Owner approval。

## 验收

```shell
npm run check:components
npm run ci
```

合并请求中附上首页和组件入口截图或静态制品链接，并说明内容来源、版本策略和实际维护者。
