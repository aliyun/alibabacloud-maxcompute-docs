import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {format, resolveConfig} from 'prettier';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const options = {};
const allowedOptions = new Set([
  'id',
  'name',
  'description',
  'category',
  'owner',
]);

for (let index = 0; index < args.length; index += 2) {
  const argument = args[index];
  const key = argument?.replace(/^--/, '');
  const value = args[index + 1];
  if (
    !argument?.startsWith('--') ||
    !key ||
    !allowedOptions.has(key) ||
    !value ||
    options[key]
  ) {
    console.error('参数必须使用 --key value 格式。');
    process.exit(1);
  }
  options[key] = value;
}

const required = ['id', 'name', 'description', 'category', 'owner'];
const missing = required.filter((key) => !options[key]);
if (missing.length > 0) {
  console.error(`缺少参数：${missing.map((key) => `--${key}`).join('、')}`);
  process.exit(1);
}

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(options.id)) {
  console.error('--id 必须使用英文 kebab-case。');
  process.exit(1);
}
if (
  !new Set(['core', 'development', 'integration', 'operations']).has(
    options.category,
  )
) {
  console.error('--category 不在允许列表中。');
  process.exit(1);
}
if (
  options.description !== options.description.trim() ||
  options.description.length < 8 ||
  options.description.length > 160 ||
  /[\r\n\u0000-\u001f\u007f]/u.test(options.description)
) {
  console.error(
    '--description 必须是 8~160 个字符的单行说明，且首尾不能有空格。',
  );
  process.exit(1);
}
if (
  options.name !== options.name.trim() ||
  options.name.length > 80 ||
  /[\r\n\u0000-\u001f\u007f]/u.test(options.name)
) {
  console.error('--name 必须是 1~80 个字符的单行展示名称，且首尾不能有空格。');
  process.exit(1);
}
if (!/^@\S+$/.test(options.owner)) {
  console.error('--owner 必须是 GitLab 用户或组。');
  process.exit(1);
}

const lockPath = join(root, '.component-generator.lock');
try {
  mkdirSync(lockPath);
} catch (error) {
  if (error.code === 'EEXIST') {
    console.error(
      '已有组件生成任务正在运行。如确认没有其他任务，请删除 .component-generator.lock 后重试。',
    );
  } else {
    console.error(`无法创建组件生成锁：${error.message}`);
  }
  process.exit(1);
}

process.on('exit', () => {
  if (existsSync(lockPath)) rmdirSync(lockPath);
});

const target = join(root, 'docs/components', options.id);
if (existsSync(target)) {
  console.error(`目标目录已存在：docs/components/${options.id}`);
  process.exit(1);
}

const registryPath = join(root, 'config/components.json');
const registrySource = readFileSync(registryPath, 'utf8');
const registry = JSON.parse(registrySource);
if (registry.components.some((component) => component.id === options.id)) {
  console.error(`组件 ID 已登记：${options.id}`);
  process.exit(1);
}

const nextPosition =
  Math.max(
    0,
    ...registry.components.map((component) => {
      const categoryPath = join(root, component.path, '_category_.json');
      return JSON.parse(readFileSync(categoryPath, 'utf8')).position ?? 0;
    }),
  ) + 1;

const titleSuffixes = new Map([
  ['index.mdx', ''],
  ['quickstart.mdx', '快速开始'],
  ['concepts.mdx', '核心概念'],
  ['guides.mdx', '操作指南'],
  ['reference.mdx', '参考'],
  ['troubleshooting.mdx', '故障排查'],
  ['release-notes.mdx', '版本说明'],
]);
const prettierConfig = (await resolveConfig(root)) ?? {};

function toYamlString(value) {
  return `'${value.replaceAll("'", "''")}'`;
}

async function replaceTemplateValues(directory) {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      await replaceTemplateValues(path);
      continue;
    }
    let source = readFileSync(path, 'utf8').replaceAll(
      'component-id',
      options.id,
    );
    if (titleSuffixes.has(entry)) {
      const suffix = titleSuffixes.get(entry);
      const title = suffix ? `${options.name} ${suffix}` : options.name;
      if (!/^title:.*$/m.test(source)) {
        throw new Error(`模板缺少 title：${entry}`);
      }
      source = source.replace(/^title:.*$/m, `title: ${toYamlString(title)}`);
    }
    writeFileSync(
      path,
      await format(source, {...prettierConfig, filepath: path}),
    );
  }
}

registry.components.push({
  id: options.id,
  name: options.name,
  description: options.description,
  path: `docs/components/${options.id}`,
  href: `/docs/components/${options.id}`,
  category: options.category,
  status: 'draft',
  owner: options.owner,
});

const codeownersPath = join(root, '.gitlab/CODEOWNERS');
const codeowners = readFileSync(codeownersPath, 'utf8');
const nextCodeowners = `${codeowners.trimEnd()}\n/docs/components/${options.id}/ ${options.owner}\n`;

let mutationStarted = false;
try {
  mutationStarted = true;
  cpSync(join(root, 'templates/component'), target, {recursive: true});

  const categoryPath = join(target, '_category_.json');
  const category = JSON.parse(readFileSync(categoryPath, 'utf8'));
  category.label = options.name;
  category.position = nextPosition;
  category.link.id = `components/${options.id}/index`;
  writeFileSync(categoryPath, `${JSON.stringify(category, null, 2)}\n`);

  await replaceTemplateValues(target);
  writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
  writeFileSync(codeownersPath, nextCodeowners);
} catch (error) {
  if (mutationStarted) {
    try {
      rmSync(target, {recursive: true, force: true});
      writeFileSync(registryPath, registrySource);
      writeFileSync(codeownersPath, codeowners);
    } catch (rollbackError) {
      console.error(`自动回滚失败：${rollbackError.message}`);
    }
  }
  console.error(`创建组件失败：${error.message}`);
  process.exit(1);
}

console.log(`已创建组件：${options.id}`);
console.log('下一步：补充页面内容并运行 npm run ci。');
