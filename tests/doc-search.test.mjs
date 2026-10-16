import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
const source = readFileSync(
  new URL('../src/lib/doc-search.ts', import.meta.url),
  'utf8',
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {module: ts.ModuleKind.ESNext},
}).outputText;
const {searchDocs} = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
);
const entries = JSON.parse(
  readFileSync(new URL('../src/generated/search-index.json', import.meta.url)),
);

test('separated JDBC connection terms find the actual connection documentation', () => {
  const results = searchDocs(entries, 'JDBC 连接');
  assert.ok(results.some((e) => e.href === '/docs/products/jdbc/quickstart/'));
  assert.ok(
    results.every(
      (e) => e.product === 'jdbc' || e.keywords.toLowerCase().includes('jdbc'),
    ),
  );
});
test('product query prioritizes its quickstart over public directory pages', () => {
  assert.equal(
    searchDocs(entries, 'JDBC')[0].href,
    '/docs/products/jdbc/quickstart/',
  );
});
test('case, fullwidth input, repeated spaces and question prefix are normalized', () => {
  assert.deepEqual(
    searchDocs(entries, '如何连接 ＪＤＢＣ').map((e) => e.href),
    searchDocs(entries, '连接  jdbc').map((e) => e.href),
  );
});
test('product filtering never returns another product, including empty queries', () => {
  for (const query of ['', '连接']) {
    const results = searchDocs(entries, query, {product: 'jdbc'});
    assert.ok(results.length > 0);
    assert.ok(results.every((e) => e.product === 'jdbc'));
  }
});
test('unmatched terms cannot leak irrelevant results', () => {
  assert.deepEqual(searchDocs(entries, 'JDBC nonexistentxyz'), []);
});
test('body-only matches show contextual evidence in the snippet', () => {
  const result = searchDocs(
    [
      {
        title: '连接指南',
        description: '连接说明',
        group: 'JDBC',
        href: '/test/',
        keywords: '下载结果时可能遇到 Tunnel 错误',
      },
    ],
    'Tunnel',
  )[0];
  assert.match(result.snippet, /Tunnel/);
});
