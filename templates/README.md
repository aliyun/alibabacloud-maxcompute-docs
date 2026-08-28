# 文档模板

`docs/` 包含按文档类型组织的独立页面模板，`component/` 包含新组件的最低目录契约。

推荐使用组件生成命令，避免遗漏注册表和 CODEOWNERS：

```shell
npm run new:component -- \
  --id <component-id> \
  --name "<组件展示名称>" \
  --description "<首页卡片摘要>" \
  --category <core|development|integration|operations> \
  --owner <@gitlab-group>
```

生成后补充页面内容，确认 `.gitlab/CODEOWNERS` 中的维护组具备项目访问权限，再运行 `npm run ci`。
