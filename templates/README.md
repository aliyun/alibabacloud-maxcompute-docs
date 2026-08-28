# 文档模板

`docs/` 包含按文档类型组织的独立页面模板，`product/` 包含新产品的最低目录契约。

推荐使用产品生成命令，避免遗漏注册表和 CODEOWNERS：

```shell
npm run new:product -- \
  --id <product-id> \
  --name "<产品展示名称>" \
  --short-name "<导航短名称>" \
  --description "<首页入口摘要>" \
  --owner <@gitlab-group>
```

可以使用 `--icon <terminal|robot|desktop|cube>` 和 `--accent <orange|blue|violet|green>` 选择注册表支持的展示样式；未提供时使用生成器默认值。

生成后补充页面内容，确认 `.gitlab/CODEOWNERS` 中的维护组具备项目访问权限，再运行 `npm run ci`。
