import {useEffect, useState, type ReactNode} from 'react';
import Heading from '@theme/Heading';
import CodeBlock from '@theme/CodeBlock';
import Link from '@docusaurus/Link';
import {ArrowRight, CheckCircle, WarningCircle} from '@phosphor-icons/react';
import {buildRecipe, defaults, type GuideConfig, type Journey} from './recipes';
import styles from './styles.module.css';

const base = '/docs/products/flink-connector';
const scenarios: {
  id: Journey;
  title: string;
  description: string;
  tag: string;
}[] = [
  {
    id: 'continuous',
    title: '持续读取变更',
    description: '实时观察新增、更新与删除；可选择先读存量。',
    tag: 'Streaming Query',
  },
  {
    id: 'batch',
    title: '回放一段增量',
    description: '指定版本或时间区间，读取追加增量后结束。',
    tag: 'Batch Incremental Query',
  },
  {
    id: 'latest-partition',
    title: '跟随最新分区',
    description: '按分区发布协议读取 CDC，切换有舍弃语义。',
    tag: '进阶模式',
  },
];

function SqlPanel({
  title,
  note,
  sql,
}: {
  title: string;
  note: string;
  sql: string;
}): ReactNode {
  return (
    <section className={styles.sqlPanel}>
      <Heading as="h3">{title}</Heading>
      <p>{note}</p>
      <CodeBlock language="sql">{sql}</CodeBlock>
    </section>
  );
}

export default function FlinkIncrementalGuide(): ReactNode {
  const [config, setConfig] = useState<GuideConfig>({...defaults});
  const [shared, setShared] = useState('');
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const journey = params.get('scenario');
    if (scenarios.some((s) => s.id === journey))
      setConfig((c) => ({
        ...c,
        journey: journey as Journey,
        incremental: 'CDC',
        ...(journey === 'batch' ? {incremental: 'APPEND' as const} : {}),
      }));
  }, []);
  const set = <K extends keyof GuideConfig>(key: K, value: GuideConfig[K]) =>
    setConfig((c) => ({...c, [key]: value}));
  const chooseJourney = (journey: Journey) =>
    setConfig((c) => ({
      ...c,
      journey,
      startup: 'latest',
      incremental: journey === 'batch' ? 'APPEND' : 'CDC',
    }));
  const recipe = buildRecipe(config);
  const batch = config.journey === 'batch';
  const latestPartition = config.journey === 'latest-partition';
  const share = async () => {
    const url = new URL(window.location.href);
    url.search = new URLSearchParams({scenario: config.journey}).toString();
    url.hash = '';
    try {
      await navigator.clipboard.writeText(url.toString());
      setShared('场景链接已复制，连接信息不会包含在链接中。');
    } catch {
      setShared('浏览器未允许复制，请从地址栏复制本页链接。');
    }
  };
  const startupNote =
    config.startup === 'latest'
      ? '跳过启动前存量。先启动查询，等待源建立起点，再在 MaxCompute 写入测试变更。'
      : config.startup === 'latest-full'
        ? '先读取一次当前快照，再持续读取变更。用已有测试数据验证快照与增量的衔接。'
        : config.startup === 'from-snapshot'
          ? '起点版本排除在增量范围之外。先从真实表取得版本，并确认它仍在可读保留范围内。'
          : config.startup === 'from-timestamp'
            ? '从指定时间开始读取后续变更。不要用部署时区与服务时区不一致的时间值。'
            : '指定历史快照后接增量的模式当前没有实现。';

  return (
    <div className={styles.guide}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>FLINK SQL · INCREMENTAL READING</span>
        <Heading as="h1">增量读取操作向导</Heading>
        <p>
          从场景选择到结果核验，在两个 SQL 窗口完成 MaxCompute 与 Flink
          的增量读取练习。
        </p>
        <div className={styles.version}>
          Connector 1.20.0 候选 · Flink 1.20.4 · JDK 17
        </div>
        <div className={styles.heroLinks}>
          <Link to={`${base}/downloads/`}>
            获取 Connector <ArrowRight aria-hidden="true" size={16} />
          </Link>
          <button onClick={share} type="button">
            复制场景链接
          </button>
        </div>
        <p className={styles.shareStatus} role="status">
          {shared}
        </p>
      </section>
      <nav className={styles.steps} aria-label="操作步骤">
        <a href="#choose">01 选择场景</a>
        <a href="#prepare">02 准备环境</a>
        <a href="#sql">03 运行 SQL</a>
        <a href="#verify">04 核验结果</a>
      </nav>

      <section id="choose" className={styles.section}>
        <Heading as="h2">1. 选择要完成的任务</Heading>
        <div className={styles.scenarios}>
          {scenarios.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={config.journey === s.id}
              className={config.journey === s.id ? styles.selected : ''}
              onClick={() => chooseJourney(s.id)}
            >
              <span>{s.tag}</span>
              <strong>{s.title}</strong>
              <p>{s.description}</p>
            </button>
          ))}
        </div>
        <div className={styles.fields}>
          {!batch && (
            <label>
              启动位置
              <select
                value={config.startup}
                onChange={(e) =>
                  set('startup', e.target.value as GuideConfig['startup'])
                }
              >
                <option value="latest">latest · 只读启动后的变更</option>
                <option value="latest-full">
                  latest-full · 存量 + 后续变更
                </option>
                <option value="from-snapshot">
                  from-snapshot · 从版本继续
                </option>
                <option value="from-timestamp">
                  from-timestamp · 从时间继续
                </option>
                <option value="from-snapshot-full">
                  from-snapshot-full · 当前不支持
                </option>
              </select>
            </label>
          )}
          {batch && (
            <label>
              区间类型
              <select
                value={config.intervalKind}
                onChange={(e) =>
                  set(
                    'intervalKind',
                    e.target.value as GuideConfig['intervalKind'],
                  )
                }
              >
                <option value="version">版本区间 (start, end]</option>
                <option value="timestamp">时间区间 (start, end]</option>
              </select>
            </label>
          )}
          <label>
            增量表达
            <select
              value={config.incremental}
              onChange={(e) =>
                set('incremental', e.target.value as GuideConfig['incremental'])
              }
            >
              <option value="CDC">
                CDC · 新增 / 更新 / 删除{batch ? '（当前配方受限）' : ''}
              </option>
              <option value="APPEND">APPEND · 表数据增量</option>
            </select>
          </label>
          {!batch && (
            <label>
              版本发现间隔（秒）
              <input
                type="number"
                min="30"
                value={config.discoverySeconds}
                onChange={(e) => set('discoverySeconds', e.target.value)}
              />
            </label>
          )}
          {((batch && config.intervalKind === 'version') ||
            (!batch && config.startup === 'from-snapshot')) && (
            <label>
              起点版本
              <input
                inputMode="numeric"
                value={config.startVersion}
                onChange={(e) => set('startVersion', e.target.value)}
                placeholder="从 get_latest_version 获取"
              />
            </label>
          )}
          {batch && config.intervalKind === 'version' && (
            <label>
              终点版本
              <input
                inputMode="numeric"
                value={config.endVersion}
                onChange={(e) => set('endVersion', e.target.value)}
                placeholder="写入之后再次获取"
              />
            </label>
          )}
          {((batch && config.intervalKind === 'timestamp') ||
            (!batch && config.startup === 'from-timestamp')) && (
            <label>
              起点时间
              <input
                value={config.startTime}
                onChange={(e) => set('startTime', e.target.value)}
                placeholder="yyyy-MM-dd HH:mm:ss.SSS"
              />
            </label>
          )}
          {batch && config.intervalKind === 'timestamp' && (
            <label>
              终点时间
              <input
                value={config.endTime}
                onChange={(e) => set('endTime', e.target.value)}
                placeholder="yyyy-MM-dd HH:mm:ss.SSS"
              />
            </label>
          )}
        </div>
        <div className={styles.explanation}>
          {batch ? (
            <p>
              区间左开右闭：不含起点，包含终点。它读取区间内的变化，不能当作终点全量快照。APPEND
              不提供完整的更新与删除事件表达。
            </p>
          ) : (
            <p>{startupNote}</p>
          )}
        </div>
        {recipe.blocked && (
          <div className={styles.warning} role="alert">
            <WarningCircle aria-hidden="true" size={21} />
            <p>{recipe.blocked}</p>
          </div>
        )}
        {latestPartition && (
          <div className={styles.warning}>
            <WarningCircle aria-hidden="true" size={21} />
            <p>
              需要分区主键事务表、CDC
              以及“数据提交完成后再发布分区”的协议。切换会舍弃旧分区未读数据和后续变化；不能用于所有分区完整回放。
              <Link to={`${base}/source-latest-partition/`}>
                查看分区发布步骤
              </Link>
            </p>
          </div>
        )}
        {latestPartition && (
          <label className={styles.acknowledge}>
            <input
              type="checkbox"
              checked={config.partitionReady}
              onChange={(e) => set('partitionReady', e.target.checked)}
            />
            我已确认：生产者在数据提交完成且 CDC 可读后才发布分区。
          </label>
        )}
      </section>

      <section id="prepare" className={styles.section}>
        <Heading as="h2">2. 准备环境与连接</Heading>
        <div className={styles.prerequisites}>
          <div>
            <CheckCircle aria-hidden="true" />
            <strong>服务能力</strong>
            <p>
              目标项目可使用 Storage
              API，表具备所选增量能力；不要以普通表读取成功代替 CDC 验证。
            </p>
            <a
              href="https://help.aliyun.com/zh/maxcompute/open-storage-overview-1"
              target="_blank"
              rel="noreferrer"
            >
              Storage API 说明 ↗
            </a>
          </div>
          <div>
            <CheckCircle aria-hidden="true" />
            <strong>运行环境</strong>
            <p>
              Client、JobManager、TaskManager 安装同一分发
              JAR；均能访问服务并取得凭据。
            </p>
            <Link to={`${base}/installation/`}>构建、安装与启动 →</Link>
          </div>
          <div>
            <CheckCircle aria-hidden="true" />
            <strong>两个 SQL 窗口</strong>
            <p>
              MaxCompute SQL 用于准备和改变源表；Flink SQL Client
              用于定义映射和持续查询。
            </p>
          </div>
        </div>
        <div className={styles.fields}>
          <label>
            MaxCompute 项目
            <input
              value={config.project}
              onChange={(e) => set('project', e.target.value)}
              placeholder="project_name"
            />
          </label>
          <label>
            源表名
            <input
              value={config.table}
              onChange={(e) => set('table', e.target.value)}
            />
          </label>
          <label>
            Schema（可选）
            <input
              value={config.schema}
              onChange={(e) => set('schema', e.target.value)}
              placeholder="未启用三层命名空间时留空"
            />
          </label>
          <label>
            MaxCompute 服务地址
            <input
              value={config.endpoint}
              onChange={(e) => set('endpoint', e.target.value)}
              placeholder="https://.../api"
            />
          </label>
          <label>
            认证模板
            <select
              value={config.auth}
              onChange={(e) =>
                set('auth', e.target.value as GuideConfig['auth'])
              }
            >
              <option value="provider">凭据提供者（推荐）</option>
              <option value="access-key-template">AccessKey 占位符模板</option>
            </select>
          </label>
          {config.auth === 'provider' && (
            <label>
              凭据提供者类名
              <input
                value={config.provider}
                onChange={(e) => set('provider', e.target.value)}
                placeholder="provider_class"
              />
            </label>
          )}
          <label>
            服务端 CDC 构建
            <select
              value={config.cdcBuild}
              onChange={(e) =>
                set('cdcBuild', e.target.value as GuideConfig['cdcBuild'])
              }
            >
              <option value="sync">同步 · SQL 练习</option>
              <option value="async">异步 · 包含 Tunnel 实时写入</option>
            </select>
          </label>
          {config.cdcBuild === 'async' && (
            <label>
              CDC 构建周期（秒）
              <input
                type="number"
                min="60"
                max="3540"
                value={config.buildSeconds}
                onChange={(e) => set('buildSeconds', e.target.value)}
              />
            </label>
          )}
        </div>
        <p className={styles.help}>
          表单只在当前浏览器生成模板，不提交作业，也不收集密钥。提供者需要实现{' '}
          <code>ICredentialsProvider</code> 并安装到所有相关进程。SQL
          中的环境变量不会自动展开；
          <Link to={`${base}/connection/`}>查看认证配置</Link>。
        </p>
        <p className={styles.help}>
          同步 CDC 用于本页的 SQL 练习，不支持 Tunnel 实时写入；异步 CDC
          还受构建周期影响。旧例中的 INSERT passthrough
          开关不作为必需配置，本页用 MERGE 新增数据。
          <a
            href="https://help.aliyun.com/zh/maxcompute/user-guide/change-data-capture"
            target="_blank"
            rel="noreferrer"
          >
            CDC 准备说明 ↗
          </a>
        </p>
      </section>

      <section id="sql" className={styles.section}>
        <Heading as="h2">3. 按顺序运行 SQL</Heading>
        {recipe.errors.length > 0 ? (
          <div className={styles.warning} role="alert">
            <WarningCircle aria-hidden="true" size={21} />
            <div>
              <strong>请先修正输入，SQL 暂停生成</strong>
              <ul>
                {recipe.errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : recipe.blocked ? (
          <div className={styles.templateNote}>
            <strong>当前组合不提供运行步骤</strong>
            <p>{recipe.blocked}</p>
          </div>
        ) : (
          <>
            {recipe.missing.length > 0 && (
              <div className={styles.templateNote}>
                <strong>当前为待填写模板</strong>
                <p>
                  还需填写：{recipe.missing.join('、')}
                  。代码中的尖括号占位符需要替换后才能运行；版本请从真实表获取。
                </p>
              </div>
            )}
            <SqlPanel
              title="A · MaxCompute SQL：准备独立测试表"
              note="在获准使用的测试项目中建表。表已存在时先核对结构与 CDC 配置，不在业务表上运行修改数据的练习。"
              sql={recipe.tableDDL}
            />
            <SqlPanel
              title="B · MaxCompute SQL：获取版本与历史"
              note={
                batch
                  ? '写入前记录起点，写入后记录终点，将两者填回上面的区间配置。时间区间同样需要处于有效保留范围，时间值与服务时区保持一致。'
                  : '指定版本起点时使用此结果。latest／latest-full 不需要手填版本；latest 要等待源第一次建立起点后再写入测试数据。'
              }
              sql={recipe.versions}
            />
            {recipe.initialRowsSQL && (
              <SqlPanel
                title="B2 · MaxCompute SQL：准备初始存量"
                note="latest-full 先读取这条存量，再启动 Flink 查询。确认主键 0 已出现后，再做后面的新增、更新和删除练习。"
                sql={recipe.initialRowsSQL}
              />
            )}
            {batch ? (
              <>
                <SqlPanel
                  title="C · MaxCompute SQL：产生区间内数据"
                  note="仅新增两个不同主键，记录新的终点版本。用于 APPEND 验证，不拿它模拟删除事件。"
                  sql={recipe.mutations}
                />
                {recipe.flinkSQL && (
                  <SqlPanel
                    title="D · Flink SQL Client：读取指定增量区间"
                    note="先填入真实起止版本或时间，再执行。预期读取区间内的新增数据，然后结束。"
                    sql={recipe.flinkSQL}
                  />
                )}
              </>
            ) : (
              <>
                {recipe.flinkSQL && (
                  <SqlPanel
                    title="C · Flink SQL Client：启动查询"
                    note="启动后保持查询运行。changelog 展示变化行；从作业日志确认首次版本发现与读取会话建立，再操作源表；仅看到作业 RUNNING 不足以证明起点已建立。"
                    sql={recipe.flinkSQL}
                  />
                )}
                <SqlPanel
                  title="D · MaxCompute SQL：新增、更新与删除"
                  note={
                    latestPartition
                      ? '此模式按专门的分区发布协议核验，不能套用非分区表练习。'
                      : '在另一个 MaxCompute SQL 窗口逐条执行，并在 Flink 端观察对应变化。DELETE 只删除此独立测试表中刚创建的主键 2。'
                  }
                  sql={recipe.mutations}
                />
              </>
            )}
          </>
        )}
        {recipe.blocked && (
          <p className={styles.help}>
            当前组合不提供 Flink 可执行 SQL。准备 SQL
            仅用于了解表结构；切换到支持的组合后再进行运行验证。
          </p>
        )}
      </section>

      <section id="verify" className={styles.section}>
        <Heading as="h2">4. 核验输出与完成状态</Heading>
        {latestPartition ? (
          <p>
            使用至少三个按字典序递增的分区，验证起始范围、发布时机、切换舍弃、迟到更新和
            checkpoint 恢复。
            <Link to={`${base}/source-latest-partition/`}>
              阅读完整的分区验收步骤
            </Link>
            。
          </p>
        ) : batch || config.incremental === 'APPEND' ? (
          <div className={styles.result}>
            <strong>只新增两个主键的练习</strong>
            <p>
              在已替换所有起止值的前提下，结果应包含 <code>(1, '1')</code> 与{' '}
              <code>(2, '2')</code>，顺序不固定。batch 读完结束，continuous
              保持运行。APPEND 不用于核验删除操作。
            </p>
          </div>
        ) : (
          <>
            <p>
              下面是变化类型的说明，属于预期示意，不是已执行的服务结果。更新前值是否展示，以服务实际
              CDC 记录为准；跨 bucket 的行顺序不作为验收条件。
            </p>
            <div className={styles.events}>
              <div>
                <span className={styles.insert}>+I</span>
                <strong>新增</strong>
                <p>主键 1／2 出现，值分别为 '1'／'2'。</p>
              </div>
              <div>
                <span className={styles.update}>-U / +U</span>
                <strong>更新</strong>
                <p>主键 1 的新值为 '3'；可看到更新前与更新后变化。</p>
              </div>
              <div>
                <span className={styles.remove}>-D</span>
                <strong>删除</strong>
                <p>主键 2 被删除；不能仅靠 APPEND 验证它。</p>
              </div>
            </div>
            <div className={styles.result}>
              <strong>源表最终状态（独立空表开始的练习）</strong>
              <p>
                完成全部练习后，MaxCompute 当前表应包含 <code>(1, '3')</code>
                {config.startup === 'latest-full' ? (
                  <>
                    {' '}
                    和初始存量 <code>(0, 'initial')</code>
                  </>
                ) : (
                  <>，主键 2 已删除</>
                )}
                。Flink changelog
                会保留变化过程；若要保存最终状态，将其写入独立的主键 Sink。
              </p>
              <Link to={`${base}/sink-upsert/`}>将变化写入主键目标 →</Link>
            </div>
          </>
        )}
        <details className={styles.troubleshooting}>
          <summary>没有看到数据时，按这条顺序检查</summary>
          <ol>
            <li>
              确认实际表是主键事务表，CDC／增量能力已开启，所选版本仍在保留范围。
            </li>
            <li>latest 跳过初始存量；先确认 Source 建立起点，再产生新变更。</li>
            <li>
              异步 CDC 的等待包含服务端构建周期和 Flink
              版本发现间隔，不能只等待一个轮询周期。
            </li>
            <li>
              确认两个 SQL 窗口连接同一张表，集群网络、权限与凭据提供者可用。
            </li>
            <li>普通持续模式只在启动时确定分区列表；新分区请使用专门模式。</li>
            <li>
              读取恢复、重复记录与下游最终值需独立验收；本页生成 SQL
              不代表已通过目标服务验收。
            </li>
          </ol>
          <Link to={`${base}/troubleshooting/`}>完整故障排查 →</Link>
        </details>
        <p className={styles.help}>
          持续 SQL 的 metadata／watermark 下推、有界 CDC 以及历史 batch
          快照存在当前版本限制。
          <Link to={`${base}/compatibility/`}>查看兼容性与验证范围</Link>。
        </p>
      </section>
    </div>
  );
}
