import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

const source = readFileSync(
  new URL(
    '../src/components/FlinkIncrementalGuide/recipes.ts',
    import.meta.url,
  ),
  'utf8',
);
const output = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const {defaults, buildRecipe} = await import(
  `data:text/javascript;base64,${Buffer.from(output).toString('base64')}`
);
const configured = {
  ...defaults,
  project: 'demo_project',
  endpoint: 'https://service.example.com/api',
  provider: 'example.EnvironmentProvider',
};
let checks = 0;
function check(name, fn) {
  fn();
  checks++;
  console.log(`PASS ${name}`);
}

check('latest CDC generates a continuous changelog query', () => {
  const r = buildRecipe(configured);
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.missing, []);
  assert.match(r.flinkSQL, /'execution.runtime-mode' = 'streaming'/);
  assert.match(r.flinkSQL, /'sql-client.execution.result-mode' = 'changelog'/);
  assert.match(r.flinkSQL, /'scan.mode' = 'latest'/);
  assert.match(r.mutations, /MERGE INTO demo_project\.flink_incremental_demo/);
  assert.match(r.mutations, /UPDATE .* SET val = '3'/);
  assert.match(r.mutations, /DELETE FROM .* WHERE id = 2/);
  assert.doesNotMatch(r.tableDDL, /passthrough/);
});
check('latest-full supplies a separate initial snapshot fixture', () => {
  const r = buildRecipe({...configured, startup: 'latest-full'});
  assert.match(r.initialRowsSQL, /CAST\(0 AS BIGINT\)/);
  assert.match(r.initialRowsSQL, /'initial'/);
});
check('snapshot long IDs remain precise', () => {
  const r = buildRecipe({
    ...configured,
    startup: 'from-snapshot',
    startVersion: '9007199254740993',
  });
  assert.deepEqual(r.errors, []);
  assert.match(r.flinkSQL, /'scan.snapshot-version' = '9007199254740993'/);
});
check('timestamp continuous startup uses the current key', () => {
  const r = buildRecipe({
    ...configured,
    startup: 'from-timestamp',
    startTime: '2026-10-13 01:02:03.004',
  });
  assert.deepEqual(r.errors, []);
  assert.match(r.flinkSQL, /'scan.timestamp' = '2026-10-13 01:02:03.004'/);
});
check('bounded APPEND uses one exclusive-inclusive version interval', () => {
  const r = buildRecipe({
    ...configured,
    journey: 'batch',
    incremental: 'APPEND',
    startVersion: '5',
    endVersion: '10',
  });
  assert.match(r.flinkSQL, /'execution.runtime-mode' = 'batch'/);
  assert.match(r.flinkSQL, /'scan.incremental-between' = '5,10'/);
  assert.doesNotMatch(
    r.flinkSQL,
    /continuousDiscoveryInterval|scan.snapshot-version/,
  );
  assert.doesNotMatch(r.mutations, /DELETE FROM|UPDATE demo/);
});
check('bounded timestamps do not leak unused version options', () => {
  const r = buildRecipe({
    ...configured,
    journey: 'batch',
    incremental: 'APPEND',
    intervalKind: 'timestamp',
    startTime: '2026-10-13 00:00:00.000',
    endTime: '2026-10-13 01:00:00.000',
  });
  assert.deepEqual(r.errors, []);
  assert.match(r.flinkSQL, /scan.incremental-between-timestamp/);
  assert.doesNotMatch(r.flinkSQL, /'scan.incremental-between'/);
});
check('bounded CDC and historical snapshot-full withhold SQL', () => {
  for (const config of [
    {...configured, journey: 'batch', startVersion: '1', endVersion: '5'},
    {...configured, startup: 'from-snapshot-full'},
  ]) {
    const r = buildRecipe(config);
    assert.ok(r.blocked);
    assert.equal(r.flinkSQL, '');
  }
});
check('invalid identifiers and injected endpoint text withhold SQL', () => {
  for (const patch of [
    {table: 'x; DROP TABLE users'},
    {project: 'a.b'},
    {schema: 'default\nDELETE'},
    {endpoint: 'https://user:password@service.example.com/api'},
    {endpoint: 'javascript:alert(1)'},
    {provider: "a.b';DROP TABLE x"},
  ]) {
    const r = buildRecipe({...configured, ...patch});
    assert.ok(r.errors.length);
    assert.equal(r.flinkSQL, '');
  }
});
check('invalid intervals and calendar dates withhold SQL', () => {
  for (const patch of [
    {startVersion: '10', endVersion: '5'},
    {startVersion: '5', endVersion: '5'},
    {startVersion: '-1', endVersion: '5'},
    {startVersion: '9223372036854775808', endVersion: '9223372036854775809'},
    {
      intervalKind: 'timestamp',
      startTime: '2026-02-30 00:00:00.000',
      endTime: '2026-03-02 00:00:00.000',
    },
  ]) {
    const r = buildRecipe({
      ...configured,
      journey: 'batch',
      incremental: 'APPEND',
      ...patch,
    });
    assert.ok(r.errors.length);
    assert.equal(r.flinkSQL, '');
  }
});
check('incomplete intervals carry visible placeholders', () => {
  const r = buildRecipe({...defaults, journey: 'batch', incremental: 'APPEND'});
  assert.ok(r.missing.includes('起点版本'));
  assert.ok(r.missing.includes('终点版本'));
  assert.match(r.flinkSQL, /<start_version>,<end_version>/);
});
check('latest partition options exclude fixed partitions', () => {
  const r = buildRecipe({
    ...configured,
    journey: 'latest-partition',
    partitionReady: true,
  });
  assert.match(r.flinkSQL, /'scan.partition.latest' = 'true'/);
  assert.match(r.flinkSQL, /'scan.partition.ready-mode' = 'partition-visible'/);
  assert.match(r.flinkSQL, /PARTITIONED BY \(ds\)/);
  assert.doesNotMatch(r.flinkSQL, /'scan.partition' =/);
  for (const patch of [
    {startup: 'latest-full'},
    {startup: 'from-timestamp'},
    {incremental: 'APPEND'},
  ])
    assert.equal(
      buildRecipe({
        ...configured,
        journey: 'latest-partition',
        partitionReady: true,
        ...patch,
      }).flinkSQL,
      '',
    );
});
check('latest partition readiness requires explicit acknowledgment', () => {
  assert.equal(
    buildRecipe({
      ...configured,
      journey: 'latest-partition',
      partitionReady: false,
    }).flinkSQL,
    '',
  );
});
check('schema, credential and CDC-build switches remain separate', () => {
  const r = buildRecipe({
    ...configured,
    schema: 'analytics',
    auth: 'access-key-template',
    cdcBuild: 'async',
  });
  assert.match(r.flinkSQL, /demo_project.analytics.flink_incremental_demo/);
  assert.match(r.flinkSQL, /'odps.namespace.schema' = 'true'/);
  assert.match(r.flinkSQL, /<access_key_secret>/);
  assert.doesNotMatch(r.flinkSQL, /odps.credentials.provider/);
  assert.match(r.tableDDL, /'acid.cdc.build.interval' = '300'/);
  assert.ok(
    buildRecipe({...configured, cdcBuild: 'async', buildSeconds: '59'}).errors
      .length,
  );
  assert.ok(buildRecipe({...configured, discoverySeconds: '29'}).errors.length);
});
console.log(`Flink guide contracts passed: ${checks} scenarios.`);
