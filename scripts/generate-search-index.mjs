import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import {dirname, extname, join, relative, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {load as parseYaml} from 'js-yaml';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const docsRoot = join(root, 'docs');
const outputPath = join(root, 'src/generated/search-index.json');
const checkOnly = process.argv.includes('--check');
const registry = JSON.parse(
  readFileSync(join(root, 'config/products.json'), 'utf8'),
);
const productNames = new Map(
  registry.products.map((product) => [product.id, product.name]),
);

function collectDocumentFiles(directory) {
  return readdirSync(directory, {withFileTypes: true})
    .sort((left, right) => left.name.localeCompare(right.name, 'en'))
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return collectDocumentFiles(path);
      return entry.isFile() && ['.md', '.mdx'].includes(extname(entry.name))
        ? [path]
        : [];
    });
}

function readDocument(file) {
  const source = readFileSync(file, 'utf8');
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    throw new Error(`${relative(root, file)} 缺少有效的 YAML front matter。`);
  }

  const data = parseYaml(match[1]);
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`${relative(root, file)} 的 front matter 不是对象。`);
  }

  return {data, body: source.slice(match[0].length)};
}

function routeFor(file, slug) {
  if (typeof slug === 'string' && slug.trim()) {
    const normalizedSlug = slug.trim().replace(/^\/+|\/+$/g, '');
    return normalizedSlug ? `/docs/${normalizedSlug}/` : '/docs/';
  }

  const segments = relative(docsRoot, file)
    .split(sep)
    .map((segment) => segment.replace(/\.(md|mdx)$/, ''));
  if (segments.at(-1) === 'index') segments.pop();
  return segments.length > 0 ? `/docs/${segments.join('/')}/` : '/docs/';
}

function stripMarkup(value) {
  return value
    .replace(/^\s*(?:```|~~~).*$/gm, ' ')
    .replace(/^import\s.+$/gm, ' ')
    .replace(/^export\s.+$/gm, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_>#|{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function groupFor(product) {
  if (productNames.has(product)) return productNames.get(product);
  return 'MaxCompute 文档';
}

const entries = collectDocumentFiles(docsRoot)
  .map((file) => {
    const {data, body} = readDocument(file);
    if (typeof data.title !== 'string' || !data.title.trim()) {
      throw new Error(`${relative(root, file)} 缺少有效的 title。`);
    }
    if (typeof data.description !== 'string' || !data.description.trim()) {
      throw new Error(`${relative(root, file)} 缺少有效的 description。`);
    }

    const tags = Array.isArray(data.tags)
      ? data.tags.filter((tag) => typeof tag === 'string')
      : [];
    const headings = [...body.matchAll(/^#{2,6}\s+(.+)$/gm)].map((match) =>
      stripMarkup(match[1]),
    );
    const keywords = stripMarkup(
      [tags.join(' '), headings.join(' '), body].join(' '),
    ).slice(0, 4000);

    return {
      title: data.title.trim(),
      description: data.description.trim(),
      href: routeFor(file, data.slug),
      group: groupFor(data.product),
      keywords,
    };
  })
  .sort((left, right) => left.href.localeCompare(right.href, 'en'));

const duplicateRoutes = entries
  .map((entry) => entry.href)
  .filter((href, index, routes) => routes.indexOf(href) !== index);
if (duplicateRoutes.length > 0) {
  throw new Error(
    `搜索索引存在重复路由：${[...new Set(duplicateRoutes)].join(', ')}`,
  );
}

const output = `${JSON.stringify(entries, null, 2)}\n`;
if (checkOnly) {
  if (!existsSync(outputPath) || readFileSync(outputPath, 'utf8') !== output) {
    console.error(
      '搜索索引未同步。请运行 npm run generate:search 并提交生成结果。',
    );
    process.exit(1);
  }
  console.log(`搜索索引校验通过：${entries.length} 篇文档。`);
} else {
  mkdirSync(dirname(outputPath), {recursive: true});
  if (!existsSync(outputPath) || readFileSync(outputPath, 'utf8') !== output) {
    writeFileSync(outputPath, output, 'utf8');
    console.log(`已生成搜索索引：${entries.length} 篇文档。`);
  } else {
    console.log(`搜索索引无需更新：${entries.length} 篇文档。`);
  }
}
