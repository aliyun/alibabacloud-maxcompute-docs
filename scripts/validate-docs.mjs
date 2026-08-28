import {readdirSync, readFileSync, statSync} from 'node:fs';
import {basename, dirname, extname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {load as parseYaml} from 'js-yaml';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const docsRoot = join(root, 'docs');
const registry = JSON.parse(
  readFileSync(join(root, 'config/products.json'), 'utf8'),
);
const productIds = new Set([
  'platform',
  ...registry.products.map((product) => product.id),
]);
const docTypes = new Set([
  'overview',
  'quickstart',
  'concept',
  'how-to',
  'tutorial',
  'reference',
  'troubleshooting',
  'release-note',
  'governance',
]);
const statuses = new Set(['draft', 'published', 'deprecated']);
const errors = [];

function collectFiles(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) return collectFiles(path);
    return ['.md', '.mdx'].includes(extname(path)) ? [path] : [];
  });
}

function parseFrontMatter(source) {
  if (!source.startsWith('---\n')) return null;
  const end = source.indexOf('\n---\n', 4);
  if (end === -1) return null;
  const raw = source.slice(4, end);
  try {
    const data = parseYaml(raw);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
    return {data, body: source.slice(end + 5)};
  } catch {
    return null;
  }
}

const docsFiles = collectFiles(docsRoot);
for (const file of docsFiles) {
  const displayPath = relative(root, file);
  const pathWithinDocs = relative(docsRoot, file).split(/[\\/]/);
  const source = readFileSync(file, 'utf8');
  const parsed = parseFrontMatter(source);

  if (!parsed) {
    errors.push(`${displayPath}: 缺少有效的 YAML front matter。`);
    continue;
  }

  for (const key of ['title', 'description', 'product', 'doc_type', 'status']) {
    if (
      typeof parsed.data[key] !== 'string' ||
      parsed.data[key].trim().length === 0
    ) {
      errors.push(`${displayPath}: 缺少有效的 ${key}。`);
    }
  }
  if (
    !Array.isArray(parsed.data.tags) ||
    parsed.data.tags.length === 0 ||
    parsed.data.tags.some(
      (tag) => typeof tag !== 'string' || tag.trim().length === 0,
    )
  ) {
    errors.push(`${displayPath}: tags 必须是包含至少一个非空字符串的列表。`);
  }
  if (parsed.data.product && !productIds.has(parsed.data.product)) {
    errors.push(
      `${displayPath}: product ${parsed.data.product} 未登记或不是 platform。`,
    );
  }
  if (
    pathWithinDocs[0] === 'products' &&
    pathWithinDocs.length >= 3 &&
    parsed.data.product !== pathWithinDocs[1]
  ) {
    errors.push(
      `${displayPath}: product 必须与所在产品目录 ${pathWithinDocs[1]} 一致。`,
    );
  }
  if (parsed.data.doc_type && !docTypes.has(parsed.data.doc_type)) {
    errors.push(`${displayPath}: doc_type ${parsed.data.doc_type} 不受支持。`);
  }
  if (parsed.data.status && !statuses.has(parsed.data.status)) {
    errors.push(`${displayPath}: status ${parsed.data.status} 不受支持。`);
  }

  const filename = basename(file).replace(/\.(md|mdx)$/, '');
  if (filename !== 'index' && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(filename)) {
    errors.push(`${displayPath}: 文件名必须使用英文 kebab-case。`);
  }

  let previousHeading = 1;
  let insideCodeFence = false;
  for (const [lineIndex, line] of parsed.body.split('\n').entries()) {
    if (/^```/.test(line)) {
      if (!insideCodeFence && /^```\s*$/.test(line)) {
        errors.push(`${displayPath}:${lineIndex + 1}: 代码块必须标注语言。`);
      }
      insideCodeFence = !insideCodeFence;
      continue;
    }
    if (insideCodeFence) continue;

    const heading = line.match(/^(#{1,6})\s+/);
    if (heading) {
      const level = heading[1].length;
      if (level === 1) {
        errors.push(`${displayPath}:${lineIndex + 1}: 正文不要重复 H1。`);
      }
      if (level > 4) {
        errors.push(`${displayPath}:${lineIndex + 1}: 标题层级不能超过 H4。`);
      }
      if (level > previousHeading + 1) {
        errors.push(`${displayPath}:${lineIndex + 1}: 标题层级发生跳级。`);
      }
      previousHeading = level;
    }
  }

  if (/\b(?:TODO|FIXME)\b/i.test(source)) {
    errors.push(`${displayPath}: 不得残留 TODO 或 FIXME。`);
  }
  if (/LTAI[A-Za-z0-9]{16,}/.test(source)) {
    errors.push(`${displayPath}: 疑似包含 AccessKey。`);
  }
  if (/Dinosaurs are cool|My Site|Tutorial Intro/.test(source)) {
    errors.push(`${displayPath}: 包含 Docusaurus 默认示例文案。`);
  }
}

if (errors.length > 0) {
  console.error(`文档契约校验失败，共 ${errors.length} 项：`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`文档契约校验通过：${docsFiles.length} 篇文档。`);
