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
  'short-name',
  'description',
  'owner',
  'icon',
  'accent',
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

const required = ['id', 'name', 'short-name', 'description', 'owner'];
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
  options.description !== options.description.trim() ||
  options.description.length < 8 ||
  options.description.length > 160 ||
  /[\r\n\u0000-\u001f\u007f]/u.test(options.description)
) {
  console.error('--description 必须是 8~160 个字符的单行说明。');
  process.exit(1);
}
if (
  options.name !== options.name.trim() ||
  options.name.length > 80 ||
  options['short-name'] !== options['short-name'].trim() ||
  options['short-name'].length > 40
) {
  console.error('--name 或 --short-name 格式不正确。');
  process.exit(1);
}
if (!/^@\S+$/.test(options.owner)) {
  console.error('--owner 必须是 GitLab 用户或组。');
  process.exit(1);
}

const icon = options.icon ?? 'cube';
const accent = options.accent ?? 'green';
if (!new Set(['terminal', 'robot', 'desktop', 'cube']).has(icon)) {
  console.error('--icon 不在允许列表中。');
  process.exit(1);
}
if (!new Set(['orange', 'blue', 'violet', 'green']).has(accent)) {
  console.error('--accent 不在允许列表中。');
  process.exit(1);
}

const lockPath = join(root, '.product-generator.lock');
try {
  mkdirSync(lockPath);
} catch (error) {
  if (error.code === 'EEXIST') {
    console.error('已有产品生成任务正在运行。');
  } else {
    console.error(`无法创建产品生成锁：${error.message}`);
  }
  process.exit(1);
}

process.on('exit', () => {
  if (existsSync(lockPath)) rmdirSync(lockPath);
});

const target = join(root, 'docs/products', options.id);
if (existsSync(target)) {
  console.error(`目标目录已存在：docs/products/${options.id}`);
  process.exit(1);
}

const registryPath = join(root, 'config/products.json');
const registrySource = readFileSync(registryPath, 'utf8');
const registry = JSON.parse(registrySource);
if (registry.products.some((product) => product.id === options.id)) {
  console.error(`产品 ID 已登记：${options.id}`);
  process.exit(1);
}

const nextPosition =
  Math.max(
    0,
    ...registry.products.map((product) => {
      const categoryPath = join(root, product.path, '_category_.json');
      return JSON.parse(readFileSync(categoryPath, 'utf8')).position ?? 0;
    }),
  ) + 1;
const titleSuffixes = new Map([
  ['index.mdx', ''],
  ['quickstart.mdx', '快速开始'],
  ['guides.mdx', '使用指南'],
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
      'product-id',
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

const href = `/docs/products/${options.id}/`;
registry.products.push({
  id: options.id,
  name: options.name,
  shortName: options['short-name'],
  description: options.description,
  path: `docs/products/${options.id}`,
  href,
  status: 'draft',
  owner: options.owner,
  icon,
  accent,
  featured: false,
  navigation: [
    {label: '快速开始', href: `${href}quickstart/`},
    {label: '使用指南', href: `${href}guides/`},
    {label: '参考', href: `${href}reference/`},
    {label: '故障排查', href: `${href}troubleshooting/`},
  ],
});

const codeownersPath = join(root, '.gitlab/CODEOWNERS');
const codeowners = readFileSync(codeownersPath, 'utf8');
const nextCodeowners = `${codeowners.trimEnd()}\n/docs/products/${options.id}/ ${options.owner}\n`;

try {
  cpSync(join(root, 'templates/product'), target, {recursive: true});
  const categoryPath = join(target, '_category_.json');
  const category = JSON.parse(readFileSync(categoryPath, 'utf8'));
  category.label = options.name;
  category.position = nextPosition;
  category.link.id = `products/${options.id}/index`;
  writeFileSync(categoryPath, `${JSON.stringify(category, null, 2)}\n`);

  await replaceTemplateValues(target);
  writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
  writeFileSync(codeownersPath, nextCodeowners);
} catch (error) {
  try {
    rmSync(target, {recursive: true, force: true});
    writeFileSync(registryPath, registrySource);
    writeFileSync(codeownersPath, codeowners);
  } catch (rollbackError) {
    console.error(`自动回滚失败：${rollbackError.message}`);
  }
  console.error(`创建产品失败：${error.message}`);
  process.exit(1);
}

console.log(`已创建产品文档空间：${options.id}`);
console.log('下一步：补充经过验证的页面内容并运行 npm run ci。');
