export type Journey = 'continuous' | 'batch' | 'latest-partition';
export type Startup =
  | 'latest'
  | 'latest-full'
  | 'from-snapshot'
  | 'from-timestamp'
  | 'from-snapshot-full';
export type GuideConfig = {
  journey: Journey;
  partitionReady: boolean;
  startup: Startup;
  incremental: 'CDC' | 'APPEND';
  intervalKind: 'version' | 'timestamp';
  project: string;
  schema: string;
  table: string;
  endpoint: string;
  provider: string;
  auth: 'provider' | 'access-key-template';
  startVersion: string;
  endVersion: string;
  startTime: string;
  endTime: string;
  discoverySeconds: string;
  cdcBuild: 'sync' | 'async';
  buildSeconds: string;
};

export const defaults: GuideConfig = {
  journey: 'continuous',
  partitionReady: false,
  startup: 'latest',
  incremental: 'CDC',
  intervalKind: 'version',
  project: '',
  schema: '',
  table: 'flink_incremental_demo',
  endpoint: '',
  provider: '',
  auth: 'provider',
  startVersion: '',
  endVersion: '',
  startTime: '',
  endTime: '',
  discoverySeconds: '60',
  cdcBuild: 'sync',
  buildSeconds: '300',
};

const identifier = /^[A-Za-z_][A-Za-z0-9_]*$/;
const version = /^(0|[1-9]\d*)$/;
const timestamp = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})\.(\d{3})$/;
const quote = (value: string) => `'${value.replace(/'/g, "''")}'`;

function validVersion(value: string): boolean {
  return version.test(value) && BigInt(value) <= 9223372036854775807n;
}
function validTimestamp(value: string): boolean {
  const match = value.match(timestamp);
  if (!match) return false;
  const [year, month, day, hour, minute, second, millisecond] = match
    .slice(1)
    .map(Number);
  const date = new Date(
    Date.UTC(year, month - 1, day, hour, minute, second, millisecond),
  );
  return (
    year >= 1000 &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    date.getUTCHours() === hour &&
    date.getUTCMinutes() === minute &&
    date.getUTCSeconds() === second
  );
}

export function buildRecipe(config: GuideConfig) {
  const errors: string[] = [];
  const missing: string[] = [];
  const pending = (value: string, placeholder: string, label: string) => {
    if (value.trim()) return value.trim();
    missing.push(label);
    return `<${placeholder}>`;
  };
  for (const [label, value] of [
    ['项目', config.project],
    ['Schema', config.schema],
    ['表名', config.table],
  ]) {
    if (value && !identifier.test(value))
      errors.push(`${label}仅支持字母、数字和下划线，且不能以数字开头。`);
  }
  if (config.endpoint) {
    try {
      const url = new URL(config.endpoint);
      if (
        !['https:', 'http:'].includes(url.protocol) ||
        url.username ||
        url.password ||
        /\s/.test(config.endpoint)
      )
        throw new Error();
    } catch {
      errors.push('服务地址应为不含用户名、密码和空格的 HTTP(S) URL。');
    }
  }
  if (
    config.auth === 'provider' &&
    config.provider &&
    !/^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)+$/.test(config.provider)
  )
    errors.push('凭据提供者应为完整 Java 类名。');
  if (
    config.journey !== 'batch' &&
    (!/^\d+$/.test(config.discoverySeconds) ||
      !Number.isSafeInteger(Number(config.discoverySeconds)) ||
      Number(config.discoverySeconds) < 30)
  )
    errors.push('持续发现间隔至少为 30 秒。');
  if (
    config.cdcBuild === 'async' &&
    (!/^\d+$/.test(config.buildSeconds) ||
      Number(config.buildSeconds) < 60 ||
      Number(config.buildSeconds) > 3540)
  )
    errors.push('异步 CDC 构建周期应为 60～3540 秒。');

  const versionStart =
    (config.journey === 'batch' && config.intervalKind === 'version') ||
    (config.journey !== 'batch' && config.startup === 'from-snapshot');
  const timeStart =
    (config.journey === 'batch' && config.intervalKind === 'timestamp') ||
    (config.journey !== 'batch' && config.startup === 'from-timestamp');
  if (versionStart && config.startVersion && !validVersion(config.startVersion))
    errors.push('起点版本应为非负 long 整数。');
  if (
    config.journey === 'batch' &&
    config.intervalKind === 'version' &&
    config.endVersion &&
    !validVersion(config.endVersion)
  )
    errors.push('终点版本应为非负 long 整数。');
  if (
    config.journey === 'batch' &&
    config.intervalKind === 'version' &&
    validVersion(config.startVersion) &&
    validVersion(config.endVersion) &&
    BigInt(config.startVersion) >= BigInt(config.endVersion)
  )
    errors.push('终点版本必须大于起点版本。');
  if (timeStart && config.startTime && !validTimestamp(config.startTime))
    errors.push('起点时间格式为 yyyy-MM-dd HH:mm:ss.SSS，且应是有效日期。');
  if (
    config.journey === 'batch' &&
    config.intervalKind === 'timestamp' &&
    config.endTime &&
    !validTimestamp(config.endTime)
  )
    errors.push('终点时间格式为 yyyy-MM-dd HH:mm:ss.SSS，且应是有效日期。');
  if (
    config.journey === 'batch' &&
    config.intervalKind === 'timestamp' &&
    validTimestamp(config.startTime) &&
    validTimestamp(config.endTime) &&
    config.startTime >= config.endTime
  )
    errors.push('终点时间必须晚于起点时间。');

  const blocked =
    config.journey === 'batch' && config.incremental === 'CDC'
      ? '有界 CDC 的 SQL 变更契约尚未闭合，当前不生成可执行配方。完整变化读取请选择持续 CDC；有界追加读取请选择 APPEND。'
      : config.journey !== 'batch' && config.startup === 'from-snapshot-full'
        ? '当前不支持 from-snapshot-full。读取当前存量后持续追踪请选择 latest-full。'
        : config.journey === 'latest-partition' &&
            (!['latest', 'from-snapshot'].includes(config.startup) ||
              config.incremental !== 'CDC')
          ? '最新分区模式仅支持 CDC，以及 latest 或 from-snapshot 起点。'
          : config.journey === 'latest-partition' && !config.partitionReady
            ? '请先确认生产者会在数据提交和 CDC 可读后发布分区，再启用 partition-visible 声明。'
            : '';
  const project = pending(config.project, 'project_name', '项目名');
  const table = pending(config.table, 'table_name', '表名');
  const path = [project, ...(config.schema ? [config.schema] : []), table].join(
    '.',
  );
  const endpoint = pending(config.endpoint, 'endpoint', '服务地址');
  const provider =
    config.auth === 'provider'
      ? pending(config.provider, 'provider_class', '凭据提供者类名')
      : '';
  const partitioned = config.journey === 'latest-partition';
  const tableDDL = `-- 在 MaxCompute SQL 执行；使用独立测试表。\nCREATE TABLE ${path} (\n  id BIGINT NOT NULL PRIMARY KEY,\n  val STRING\n)${partitioned ? '\nPARTITIONED BY (ds STRING)' : ''}\nTBLPROPERTIES (\n  'transactional' = 'true',\n  'acid.cdc.mode.enable' = 'true',\n  'acid.cdc.build.async' = '${config.cdcBuild === 'async'}'${config.cdcBuild === 'async' ? `,\n  'acid.cdc.build.interval' = '${config.buildSeconds}'` : ''},\n  'cdc.data.retain.hours' = '24'\n);`;
  const versions = `-- 在 MaxCompute SQL 执行；记录实际版本，不能猜测或使用示例序号。\nSELECT get_latest_version(${quote(path)});\nSHOW HISTORY FOR TABLE ${path};`;
  const options: [string, string][] = [
    ['connector', 'maxcompute'],
    ['table.name', path],
    ['odps.project.name', project],
    ['odps.end.point', endpoint],
  ];
  if (config.schema) options.push(['odps.namespace.schema', 'true']);
  if (config.auth === 'provider')
    options.push(['odps.credentials.provider', provider]);
  else
    options.push(
      ['odps.access.id', '<access_key_id>'],
      ['odps.access.key', '<access_key_secret>'],
    );
  if (config.auth === 'access-key-template')
    missing.push('AccessKey ID 占位符', 'AccessKey Secret 占位符');
  if (config.journey === 'batch') {
    options.push(['scan.mode', 'incremental']);
    options.push(
      config.intervalKind === 'version'
        ? [
            'scan.incremental-between',
            `${pending(config.startVersion, 'start_version', '起点版本')},${pending(config.endVersion, 'end_version', '终点版本')}`,
          ]
        : [
            'scan.incremental-between-timestamp',
            `${pending(config.startTime, 'start_timestamp', '起点时间')},${pending(config.endTime, 'end_timestamp', '终点时间')}`,
          ],
    );
  } else {
    options.push(['scan.mode', config.startup]);
    if (config.startup === 'from-snapshot')
      options.push([
        'scan.snapshot-version',
        pending(config.startVersion, 'start_version', '起点版本'),
      ]);
    if (config.startup === 'from-timestamp')
      options.push([
        'scan.timestamp',
        pending(config.startTime, 'start_timestamp', '起点时间'),
      ]);
    options.push([
      'continuousDiscoveryInterval',
      `${config.discoverySeconds} s`,
    ]);
    if (partitioned)
      options.push(
        ['scan.partition.latest', 'true'],
        ['scan.partition.ready-mode', 'partition-visible'],
      );
  }
  options.push(['scan.incremental.mode', config.incremental]);
  const prefix =
    config.journey === 'batch'
      ? "SET 'execution.runtime-mode' = 'batch';"
      : "SET 'execution.runtime-mode' = 'streaming';\nSET 'execution.checkpointing.interval' = '60 s';\nSET 'sql-client.execution.result-mode' = 'changelog';";
  const flinkSQL = `${prefix}\n\nCREATE TEMPORARY TABLE mc_incremental_source (\n  id BIGINT NOT NULL,\n  val STRING,${partitioned ? '\n  ds STRING,' : ''}\n  PRIMARY KEY (id) NOT ENFORCED\n)${partitioned ? ' PARTITIONED BY (ds)' : ''} WITH (\n${options.map(([key, value]) => `  ${quote(key)} = ${quote(value)}`).join(',\n')}\n);\n\nSELECT * FROM mc_incremental_source;`;
  const merge = (id: number, value: string) =>
    `MERGE INTO ${path} AS t\nUSING (SELECT CAST(${id} AS BIGINT) AS id, '${value}' AS val) AS s\nON t.id = s.id\nWHEN MATCHED THEN UPDATE SET t.val = s.val\nWHEN NOT MATCHED THEN INSERT VALUES (s.id, s.val);`;
  const mutations = partitioned
    ? '-- 最新分区模式需要自己的分区发布协议；请按下方专门指南准备和发布分区，不套用非分区演示。'
    : `-- 以下在 MaxCompute SQL 执行，不是在 Flink SQL Client 执行。\n-- 先新增两个不同主键。\n${merge(1, '1')}\n\n${merge(2, '2')}${config.incremental === 'CDC' && config.journey !== 'batch' ? `\n\n-- 更新主键 1。\nUPDATE ${path} SET val = '3' WHERE id = 1;\n\n-- 删除主键 2；仅对上述独立测试数据执行。\nDELETE FROM ${path} WHERE id = 2;` : ''}\n\n-- 核对源表当前值。\nSELECT id, val FROM ${path} ORDER BY id;`;
  const initialRowsSQL =
    !partitioned &&
    config.journey === 'continuous' &&
    config.startup === 'latest-full'
      ? merge(0, 'initial')
      : '';
  return {
    initialRowsSQL,
    errors,
    missing: [...new Set(missing)],
    blocked,
    tableDDL,
    versions,
    flinkSQL: errors.length || blocked ? '' : flinkSQL,
    mutations,
    path,
  };
}
