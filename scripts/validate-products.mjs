import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const registry = JSON.parse(
  readFileSync(join(root, 'config/products.json'), 'utf8'),
);
const schema = JSON.parse(
  readFileSync(join(root, 'config/products.schema.json'), 'utf8'),
);
const errors = [];
const allowedStatuses = new Set(['draft', 'published', 'deprecated']);
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const codeownersSource = readFileSync(join(root, '.gitlab/CODEOWNERS'), 'utf8');
const exactProductOwners = new Map();

for (const line of codeownersSource.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const [pattern, ...owners] = trimmed.split(/\s+/);
  if (/^\/docs\/products\/[a-z0-9-]+\/$/.test(pattern)) {
    if (exactProductOwners.has(pattern)) {
      errors.push(`.gitlab/CODEOWNERS: ${pattern} 存在重复的精确规则。`);
    }
    exactProductOwners.set(pattern, owners);
  }
}

const validateSchema = new Ajv2020({allErrors: true}).compile(schema);
if (!validateSchema(registry)) {
  for (const error of validateSchema.errors ?? []) {
    errors.push(
      `config/products.json${error.instancePath || '/'}: ${error.message}`,
    );
  }
}

if (registry.schemaVersion !== 1) {
  errors.push('config/products.json: schemaVersion 必须为 1。');
}
if (!Array.isArray(registry.products) || registry.products.length === 0) {
  errors.push('config/products.json: products 必须是非空数组。');
}

const ids = new Set();
const registeredDirectories = new Set();

for (const [index, product] of (registry.products ?? []).entries()) {
  const location = `config/products.json: products[${index}]`;
  const expectedPath = `docs/products/${product.id}`;
  const expectedHref = `/docs/products/${product.id}/`;

  if (!idPattern.test(product.id ?? '')) {
    errors.push(`${location}: id 必须使用英文 kebab-case。`);
  }
  if (ids.has(product.id)) errors.push(`${location}: id ${product.id} 重复。`);
  ids.add(product.id);

  if (product.path !== expectedPath) {
    errors.push(`${location}: path 必须是 ${expectedPath}。`);
  }
  if (product.href !== expectedHref) {
    errors.push(`${location}: href 必须是 ${expectedHref}。`);
  }
  if (!allowedStatuses.has(product.status)) {
    errors.push(`${location}: status 不在允许列表中。`);
  }
  if (!/^@\S+$/.test(product.owner ?? '')) {
    errors.push(`${location}: owner 必须是 GitLab 用户或组。`);
  }

  const codeownersPattern = `/docs/products/${product.id}/`;
  const codeowners = exactProductOwners.get(codeownersPattern);
  if (!codeowners) {
    errors.push(
      `${location}: .gitlab/CODEOWNERS 缺少 ${codeownersPattern} 的精确规则。`,
    );
  } else if (!codeowners.includes(product.owner)) {
    errors.push(
      `${location}: owner ${product.owner} 未出现在 ${codeownersPattern} 的 CODEOWNERS 规则中。`,
    );
  }

  const absolutePath = join(root, expectedPath);
  registeredDirectories.add(absolutePath);
  for (const requiredFile of [
    '_category_.json',
    'index.mdx',
    'quickstart.mdx',
    'guides.mdx',
    'reference.mdx',
    'troubleshooting.mdx',
    'release-notes.mdx',
  ]) {
    if (!existsSync(join(absolutePath, requiredFile))) {
      errors.push(`${expectedPath}: 缺少 ${requiredFile}。`);
    }
  }

  const categoryPath = join(absolutePath, '_category_.json');
  if (existsSync(categoryPath)) {
    try {
      const category = JSON.parse(readFileSync(categoryPath, 'utf8'));
      if (category.label !== product.name) {
        errors.push(
          `${expectedPath}/_category_.json: label 必须与注册表 name 一致。`,
        );
      }
      if (
        category.link?.type !== 'doc' ||
        category.link?.id !== `products/${product.id}/index`
      ) {
        errors.push(
          `${expectedPath}/_category_.json: link 必须指向 products/${product.id}/index。`,
        );
      }
    } catch {
      errors.push(`${expectedPath}/_category_.json: 不是有效的 JSON。`);
    }
  }

  for (const item of product.navigation ?? []) {
    if (!item.href.startsWith(expectedHref)) {
      errors.push(`${location}: 导航 ${item.href} 必须位于当前产品目录。`);
      continue;
    }
    const route = item.href.slice(expectedHref.length).replace(/\/$/, '');
    if (!existsSync(join(absolutePath, `${route}.mdx`))) {
      errors.push(`${location}: 导航 ${item.href} 没有对应的 MDX 页面。`);
    }
  }
}

const productsRoot = join(root, 'docs/products');
if (existsSync(productsRoot)) {
  for (const entry of readdirSync(productsRoot)) {
    const absolutePath = join(productsRoot, entry);
    if (
      statSync(absolutePath).isDirectory() &&
      !registeredDirectories.has(absolutePath)
    ) {
      errors.push(`docs/products/${entry}: 目录未登记到产品注册表。`);
    }
  }
}

const packageJson = JSON.parse(
  readFileSync(join(root, 'package.json'), 'utf8'),
);
const docusaurusPackages = Object.entries({
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
}).filter(([name]) => name.startsWith('@docusaurus/'));
const requiredDocusaurusPackages = [
  '@docusaurus/core',
  '@docusaurus/faster',
  '@docusaurus/preset-classic',
  '@docusaurus/module-type-aliases',
  '@docusaurus/tsconfig',
  '@docusaurus/types',
];

for (const requiredPackage of requiredDocusaurusPackages) {
  if (!docusaurusPackages.some(([name]) => name === requiredPackage)) {
    errors.push(`package.json: 缺少 ${requiredPackage}。`);
  }
}
if (
  docusaurusPackages.length === 0 ||
  docusaurusPackages.some(([, version]) => !/^\d+\.\d+\.\d+$/.test(version)) ||
  new Set(docusaurusPackages.map(([, version]) => version)).size !== 1
) {
  errors.push('package.json: 所有 @docusaurus/* 包必须使用同一准确版本。');
}

for (const lockFile of [
  'yarn.lock',
  'pnpm-lock.yaml',
  'bun.lockb',
  'bun.lock',
]) {
  if (existsSync(join(root, lockFile))) {
    errors.push(`${lockFile}: 本仓库只使用 npm 和 package-lock.json。`);
  }
}

if (errors.length > 0) {
  console.error(`产品契约校验失败，共 ${errors.length} 项：`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`产品契约校验通过：${ids.size} 个产品空间。`);
