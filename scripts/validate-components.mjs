import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const registryPath = join(root, 'config/components.json');
const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
const schema = JSON.parse(
  readFileSync(join(root, 'config/components.schema.json'), 'utf8'),
);
const errors = [];
const allowedCategories = new Set([
  'core',
  'development',
  'integration',
  'operations',
]);
const allowedStatuses = new Set(['draft', 'published', 'deprecated']);
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const codeownersSource = readFileSync(join(root, '.gitlab/CODEOWNERS'), 'utf8');
const exactComponentOwners = new Map();

for (const line of codeownersSource.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const [pattern, ...owners] = trimmed.split(/\s+/);
  if (/^\/docs\/components\/[a-z0-9-]+\/$/.test(pattern)) {
    if (exactComponentOwners.has(pattern)) {
      errors.push(`.gitlab/CODEOWNERS: ${pattern} 存在重复的精确规则。`);
    }
    exactComponentOwners.set(pattern, owners);
  }
}

const validateSchema = new Ajv2020({allErrors: true}).compile(schema);
if (!validateSchema(registry)) {
  for (const error of validateSchema.errors ?? []) {
    errors.push(
      `config/components.json${error.instancePath || '/'}: ${error.message}`,
    );
  }
}

if (registry.schemaVersion !== 1) {
  errors.push('config/components.json: schemaVersion 必须为 1。');
}

if (!Array.isArray(registry.components) || registry.components.length === 0) {
  errors.push('config/components.json: components 必须是非空数组。');
}

const ids = new Set();
const registeredDirectories = new Set();

for (const [index, component] of (registry.components ?? []).entries()) {
  const location = `config/components.json: components[${index}]`;
  const expectedPath = `docs/components/${component.id}`;
  const expectedHref = `/docs/components/${component.id}`;

  if (!idPattern.test(component.id ?? '')) {
    errors.push(`${location}: id 必须使用英文 kebab-case。`);
  }
  if (ids.has(component.id)) {
    errors.push(`${location}: id ${component.id} 重复。`);
  }
  ids.add(component.id);

  if (component.path !== expectedPath) {
    errors.push(`${location}: path 必须是 ${expectedPath}。`);
  }
  if (component.href !== expectedHref) {
    errors.push(`${location}: href 必须是 ${expectedHref}。`);
  }
  if (!allowedCategories.has(component.category)) {
    errors.push(`${location}: category 不在允许列表中。`);
  }
  if (!allowedStatuses.has(component.status)) {
    errors.push(`${location}: status 不在允许列表中。`);
  }
  if (!/^@\S+$/.test(component.owner ?? '')) {
    errors.push(`${location}: owner 必须是 GitLab 用户或组。`);
  }

  const codeownersPattern = `/docs/components/${component.id}/`;
  const codeowners = exactComponentOwners.get(codeownersPattern);
  if (!codeowners) {
    errors.push(
      `${location}: .gitlab/CODEOWNERS 缺少 ${codeownersPattern} 的精确规则。`,
    );
  } else if (!codeowners.includes(component.owner)) {
    errors.push(
      `${location}: owner ${component.owner} 未出现在 ${codeownersPattern} 的 CODEOWNERS 规则中。`,
    );
  }

  const absolutePath = join(root, expectedPath);
  registeredDirectories.add(absolutePath);
  for (const requiredFile of [
    '_category_.json',
    'index.mdx',
    'quickstart.mdx',
    'concepts.mdx',
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
      if (category.label !== component.name) {
        errors.push(
          `${expectedPath}/_category_.json: label 必须与注册表 name 一致。`,
        );
      }
      if (
        category.link?.type !== 'doc' ||
        category.link?.id !== `components/${component.id}/index`
      ) {
        errors.push(
          `${expectedPath}/_category_.json: link 必须指向 components/${component.id}/index。`,
        );
      }
    } catch {
      errors.push(`${expectedPath}/_category_.json: 不是有效的 JSON。`);
    }
  }
}

const componentsRoot = join(root, 'docs/components');
for (const entry of readdirSync(componentsRoot)) {
  const absolutePath = join(componentsRoot, entry);
  if (
    statSync(absolutePath).isDirectory() &&
    !registeredDirectories.has(absolutePath)
  ) {
    errors.push(`docs/components/${entry}: 目录未登记到组件注册表。`);
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
  console.error(`组件契约校验失败，共 ${errors.length} 项：`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`组件契约校验通过：${ids.size} 个组件。`);
