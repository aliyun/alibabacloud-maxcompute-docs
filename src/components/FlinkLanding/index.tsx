import type {ReactNode} from 'react';
import {
  ArrowRight,
  ArrowDown,
  Database,
  Code,
  Package,
} from '@phosphor-icons/react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const base = '/docs/products/flink-connector';
const reading = [
  {
    title: '存量读取',
    mode: 'bounded',
    description: '当前快照或指定分区，读完结束。',
    route: 'source-bounded',
    badge: '有界',
  },
  {
    title: '有界增量',
    mode: 'incremental',
    description: '回放版本或时间区间内的变更。',
    route: 'source-incremental',
    badge: '有界',
  },
  {
    title: '持续增量',
    mode: 'latest / latest-full',
    description: '选择仅增量，或先存量再追踪变更。',
    route: 'source-continuous',
    badge: '主键事务表',
  },
  {
    title: '最新分区 CDC',
    mode: 'partition.latest',
    description: '跟随按序发布分区，先确认切换语义。',
    route: 'source-latest-partition',
    badge: '条件支持',
  },
];
const writing = [
  {
    title: '追加写入',
    mode: 'insert',
    description: '明细追加，支持静态和动态分区。',
    route: 'sink-append',
    badge: 'INSERT',
  },
  {
    title: '主键更新与删除',
    mode: 'upsert',
    description: '同步变化行，保存主键当前值。',
    route: 'sink-upsert',
    badge: '主键表',
  },
];

function Cards({items}: {items: typeof reading}): ReactNode {
  return (
    <div className={styles.cards}>
      {items.map((item) => (
        <Link
          key={item.route}
          className={styles.card}
          to={`${base}/${item.route}/`}
        >
          <span className={styles.badge}>{item.badge}</span>
          <Heading as="h3">{item.title}</Heading>
          <code>{item.mode}</code>
          <p>{item.description}</p>
          <span className={styles.cardAction}>
            查看 SQL 配方 <ArrowRight aria-hidden="true" size={16} />
          </span>
        </Link>
      ))}
    </div>
  );
}

export default function FlinkLanding(): ReactNode {
  return (
    <div className={styles.landing}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>MAXCOMPUTE · FLINK SQL</span>
        <Heading as="h1">读写模式，一眼选清</Heading>
        <p>
          用 Flink SQL 读取存量与增量数据，将追加或主键变更写入
          MaxCompute。从完整的 SQL 示例开始，按表类型选择正确模式。
        </p>
        <div className={styles.actions}>
          <Link className={styles.primary} to={`${base}/quickstart/`}>
            运行第一个 SQL 作业 <ArrowRight aria-hidden="true" size={18} />
          </Link>
          <Link className={styles.secondary} to={`${base}/incremental-guide/`}>
            按步骤学习增量读取
          </Link>
          <Link className={styles.secondary} to={`${base}/modes/`}>
            Source、Sink 与完整参数
          </Link>
        </div>
        <div className={styles.baseline}>
          <span>Connector 1.20.0 · 文档草稿</span>
          <span>Flink 1.20.4 · JDK 17</span>
        </div>
      </section>
      <nav aria-label="入门步骤" className={styles.steps}>
        {[
          {icon: Package, label: '构建与安装', route: 'installation'},
          {icon: Code, label: 'SQL 快速开始', route: 'quickstart'},
          {icon: Database, label: '连接与认证', route: 'connection'},
        ].map((item, index) => (
          <Link key={item.route} to={`${base}/${item.route}/`}>
            <item.icon aria-hidden="true" size={23} />
            <span>
              <small>0{index + 1}</small>
              <strong>{item.label}</strong>
            </span>
            <ArrowRight aria-hidden="true" size={16} />
          </Link>
        ))}
      </nav>
      <section className={styles.source}>
        <div className={styles.sectionTitle}>
          <div>
            <span className={styles.eyebrow}>SOURCE</span>
            <Heading as="h2">从 MaxCompute 读取</Heading>
          </div>
          <span className={styles.direction}>
            MaxCompute <ArrowRight aria-hidden="true" size={16} /> Flink SQL
          </span>
        </div>
        <Cards items={reading} />
      </section>
      <section className={styles.sink}>
        <div className={styles.sectionTitle}>
          <div>
            <span className={styles.eyebrow}>SINK</span>
            <Heading as="h2">向 MaxCompute 写入</Heading>
          </div>
          <span className={styles.direction}>
            Flink SQL <ArrowRight aria-hidden="true" size={16} /> MaxCompute
          </span>
        </div>
        <Cards items={writing} />
        <Link className={styles.writerLink} to={`${base}/sink-writers/`}>
          <ArrowDown aria-hidden="true" size={18} />
          <span>
            确定业务语义后，比较协调式、文件缓存、Streaming Tunnel 与 Storage
            写入实现
          </span>
          <ArrowRight aria-hidden="true" size={18} />
        </Link>
      </section>
      <aside className={styles.note}>
        <strong>先确认表类型与交付语义</strong>
        <p>
          持续增量需要主键事务表和服务端增量能力；追加恢复可能重复。Lookup Join
          与 INSERT OVERWRITE 当前不支持。
        </p>
        <Link to={`${base}/compatibility/`}>
          查看兼容性与验证范围 <ArrowRight aria-hidden="true" size={15} />
        </Link>
      </aside>
      <nav aria-label="集成与参考" className={styles.resources}>
        {[
          ['JAR 下载', 'downloads'],
          ['Catalog', 'catalog'],
          ['Java API', 'java-api'],
          ['参数与类型', 'reference'],
          ['故障排查', 'troubleshooting'],
        ].map(([label, route]) => (
          <Link key={route} to={`${base}/${route}/`}>
            {label}
            <ArrowRight aria-hidden="true" size={15} />
          </Link>
        ))}
      </nav>
    </div>
  );
}
