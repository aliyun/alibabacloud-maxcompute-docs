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
const {searchDocs, searchKeyAction} = await import(
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

test('Chinese IME candidate keys never navigate results or close search', () => {
  for (const key of ['ArrowDown', 'ArrowUp', 'Escape', 'Tab', 'k']) {
    assert.equal(
      searchKeyAction({
        key,
        ctrlKey: true,
        metaKey: false,
        isComposing: true,
        keyCode: 0,
      }),
      'none',
    );
    assert.equal(
      searchKeyAction({
        key,
        ctrlKey: true,
        metaKey: false,
        isComposing: false,
        keyCode: 229,
      }),
      'none',
    );
  }
});
test('completed input retains keyboard navigation and platform search shortcuts', () => {
  const event = {
    ctrlKey: false,
    metaKey: false,
    isComposing: false,
    keyCode: 0,
  };
  for (const [key, action] of [
    ['ArrowDown', 'next'],
    ['ArrowUp', 'previous'],
    ['Escape', 'close'],
    ['Tab', 'tab'],
    ['a', 'none'],
  ]) {
    assert.equal(searchKeyAction({...event, key}), action);
  }
  assert.equal(searchKeyAction({...event, key: 'K', metaKey: true}), 'toggle');
  assert.equal(searchKeyAction({...event, key: 'k', ctrlKey: true}), 'toggle');
});

test('natural mixed-language queries do not require users to add spaces', () => {
  for (const [compact, spaced] of [
    ['dbt升级', 'dbt 升级'],
    ['JDBC连接', 'JDBC 连接'],
  ]) {
    assert.deepEqual(
      searchDocs(entries, compact).map((e) => e.href),
      searchDocs(entries, spaced).map((e) => e.href),
    );
    assert.ok(searchDocs(entries, compact).length > 0);
  }
});
test('project creation task surfaces preparation over search-help examples', () => {
  assert.equal(
    searchDocs(entries, '创建项目')[0].href,
    '/docs/getting-started/prepare/',
  );
});
