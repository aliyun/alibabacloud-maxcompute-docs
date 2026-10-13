import {useState, type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import options from './options.json';
import styles from './styles.module.css';

const groups = [
  '全部',
  '连接',
  'Source',
  'Sink',
  '文件缓存',
  'Catalog',
  '未注册',
];

export function Concepts(): ReactNode {
  return (
    <div className={styles.concepts}>
      <section>
        <span>MaxCompute → Flink</span>
        <h3>Source · 数据从哪里来</h3>
        <p>
          Source 把 MaxCompute 表映射为 Flink 的输入。SELECT
          从它读取数据：可以读一次存量、回放一个增量区间，或持续跟踪新的变化。
        </p>
        <Link to="/docs/products/flink-connector/source-bounded/">
          从存量读取开始 →
        </Link>
      </section>
      <section>
        <span>Flink → MaxCompute</span>
        <h3>Sink · 结果写到哪里</h3>
        <p>
          Sink 把 Flink 的结果写入 MaxCompute。INSERT INTO
          将查询结果送到目标表：追加写入接收新增行，主键写入处理更新后的值和删除。
        </p>
        <Link to="/docs/products/flink-connector/sink-append/">
          从追加写入开始 →
        </Link>
      </section>
    </div>
  );
}

export default function ParameterTable(): ReactNode {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('全部');
  const [registeredOnly, setRegisteredOnly] = useState(false);
  const needle = query.trim().toLowerCase();
  const rows = options.filter(
    (row) =>
      (group === '全部' || row.group === group) &&
      (!registeredOnly || row.group !== '未注册') &&
      `${row.key} ${row.description} ${row.default} ${row.type} ${row.status}`
        .toLowerCase()
        .includes(needle),
  );
  return (
    <div className={styles.parameters}>
      <p>
        共 {options.length} 项：88 个 SQL 工厂参数、connector 标识、3 个 Catalog
        配置及 3 个未注册定义。按 <code>codex/sca-emulator-tests</code>{' '}
        的文档基线核对；“SQL 可选”表示工厂接受，不代表每个 writer 或 Source
        路径都会使用。
      </p>
      <div className={styles.controls}>
        <label>
          搜索参数或说明
          <input
            type="search"
            placeholder="例如 scan.mode、upsert、代理"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label>
          适用范围
          <select
            value={group}
            onChange={(event) => setGroup(event.target.value)}
          >
            {groups.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={registeredOnly}
            onChange={(event) => setRegisteredOnly(event.target.checked)}
          />
          隐藏 SQL 未注册项
        </label>
      </div>
      <p role="status" aria-live="polite">
        显示 {rows.length} / {options.length} 项
      </p>
      <div
        className={styles.scroll}
        tabIndex={0}
        role="region"
        aria-label="完整参数表，可横向滚动"
      >
        <table>
          <caption>MaxCompute Flink Connector 完整参数</caption>
          <thead>
            <tr>
              <th scope="col">参数</th>
              <th scope="col">范围／状态</th>
              <th scope="col">类型／默认值</th>
              <th scope="col">用途与限制</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <th scope="row">
                  <code>{row.key}</code>
                </th>
                <td>
                  {row.group}
                  <small
                    className={row.group === '未注册' ? styles.warning : ''}
                  >
                    {row.status}
                  </small>
                </td>
                <td>
                  <code>{row.type}</code>
                  <small>{row.default}</small>
                </td>
                <td>{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <p>没有匹配的参数。修改关键词或选择“全部”范围。</p>}
      <p className={styles.note}>
        duration 使用带单位的值（如 60 s），memory 使用容量值（如 64mb）；long
        类型的字节或毫秒值按各行说明填写。无默认值不等于所有场景都必填。SQL
        表参数放在 CREATE TABLE 的 WITH 中，Catalog 参数放在 CREATE CATALOG 的
        WITH 中；服务端 CDC 建表属性和 Flink 作业配置见各模式指南。
      </p>
    </div>
  );
}
