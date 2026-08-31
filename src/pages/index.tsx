import type {ReactNode} from 'react';
import {
  ArrowRight,
  BookOpenText,
  PuzzlePiece,
  Robot,
  Terminal,
} from '@phosphor-icons/react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {DocSearchTrigger} from '@site/src/components/DocSearch';
import ProductGrid from '@site/src/components/ProductGrid';

import styles from './index.module.css';

function TerminalCard(): ReactNode {
  return (
    <div aria-hidden="true" className={styles.terminal}>
      <div className={styles.terminalBar}>
        <i />
        <i />
        <i />
        <em>maxc · agent-native CLI</em>
      </div>
      <div className={styles.terminalBody}>
        <p>
          <span className={styles.tPrompt}>$</span> aliyun maxc auth login
          --oauth --json
        </p>
        <p className={styles.tOk}>
          ✓ 认证成功 <span className={styles.tDim}>· project: my_project</span>
        </p>
        <p>
          <span className={styles.tPrompt}>$</span> aliyun maxc query{' '}
          <span className={styles.tStr}>
            &quot;SELECT * FROM sales WHERE ds=&apos;20260831&apos; LIMIT
            5&quot;
          </span>{' '}
          --json
        </p>
        <p className={styles.tJson}>{'{'}</p>
        <p className={styles.tJson}>
          {'  '}
          <span className={styles.tKey}>&quot;status&quot;</span>:{' '}
          <span className={styles.tStr}>&quot;success&quot;</span>,
        </p>
        <p className={styles.tJson}>
          {'  '}
          <span className={styles.tKey}>&quot;data&quot;</span>: {'{'}
          <span className={styles.tKey}>&quot;result&quot;</span>: {'{'}
          <span className={styles.tKey}>&quot;row_count&quot;</span>:{' '}
          <span className={styles.tNum}>5</span>
          {' } }'},
        </p>
        <p className={styles.tJson}>
          {'  '}
          <span className={styles.tKey}>&quot;agent_hints&quot;</span>: {'{'}
          <span className={styles.tKey}>&quot;action_ids&quot;</span>: [
          <span className={styles.tStr}>&quot;job.result&quot;</span>]{'}'}
        </p>
        <p className={styles.tJson}>{'}'}</p>
      </div>
    </div>
  );
}

function Hero(): ReactNode {
  return (
    <header className={styles.hero}>
      <div aria-hidden="true" className={styles.heroGlow} />
      <div className={`container ${styles.heroInner}`}>
        <div className={styles.heroCopy}>
          <span className={styles.badge}>
            <Terminal aria-hidden="true" size={14} weight="bold" />
            MAXCOMPUTE DOCS
          </span>
          <Heading as="h1" className={styles.heroTitle}>
            给人用，也给 Agent 用的 MaxCompute 文档
          </Heading>
          <p className={styles.heroSubtitle}>
            CLI、MCP Server 与 Desktop
            的统一文档入口。从一行命令完成安装认证，到结构化 JSON 协议驱动的
            Agent 集成，都从这里开始。
          </p>
          <div className={styles.heroActions}>
            <Link
              className={styles.primaryAction}
              to="/docs/products/cli/quickstart/"
            >
              CLI 快速开始 <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <DocSearchTrigger variant="hero" />
          </div>
          <dl className={styles.heroStats}>
            <div>
              <dt>3</dt>
              <dd>产品文档</dd>
            </div>
            <div>
              <dt>8</dt>
              <dd>CLI 命令家族</dd>
            </div>
            <div>
              <dt>v2.0</dt>
              <dd>Envelope 协议</dd>
            </div>
          </dl>
        </div>
        <TerminalCard />
      </div>
    </header>
  );
}

const pillars = [
  {
    icon: <Terminal aria-hidden="true" size={22} weight="duotone" />,
    title: 'CLI 工具层',
    body: 'maxc 提供元数据、查询、作业、传输等数据面操作，每条命令输出结构化 JSON Envelope。',
    href: '/docs/products/cli/command-reference/',
    label: '命令参考',
  },
  {
    icon: <Robot aria-hidden="true" size={22} weight="duotone" />,
    title: 'Agent Skill',
    body: '一条命令把 MaxCompute 知识装进 Claude Code、Cursor、Codex 等平台，Agent 即刻会用 maxc。',
    href: '/docs/products/cli/agent-skill/',
    label: '安装 Skill',
  },
  {
    icon: <PuzzlePiece aria-hidden="true" size={22} weight="duotone" />,
    title: '生态与插件',
    body: 'DSH 插件、MCP Server、Desktop 与 aliyun CLI 扩展共享同一套 CLI 能力，随处接入。',
    href: '/docs/products/cli/ecosystem/',
    label: '浏览生态',
  },
];

function Pillars(): ReactNode {
  return (
    <section className={styles.pillarSection}>
      <div className={`container ${styles.pillarGrid}`}>
        {pillars.map((pillar) => (
          <Link className={styles.pillar} key={pillar.title} to={pillar.href}>
            <span className={styles.pillarIcon}>{pillar.icon}</span>
            <strong>{pillar.title}</strong>
            <p>{pillar.body}</p>
            <small>
              {pillar.label} <ArrowRight aria-hidden="true" size={13} />
            </small>
          </Link>
        ))}
      </div>
    </section>
  );
}

const paths = [
  {
    step: '01',
    title: '第一次使用',
    body: '安装 CLI、完成 OAuth 认证、跑通第一条查询。',
    href: '/docs/products/cli/quickstart/',
  },
  {
    step: '02',
    title: '接入 AI Agent',
    body: '把 Agent Skill 注册到你使用的 Agent 平台。',
    href: '/docs/products/cli/agent-skill/',
  },
  {
    step: '03',
    title: '查阅参考',
    body: '命令参数、Envelope 协议与错误码。',
    href: '/docs/products/cli/reference/',
  },
  {
    step: '04',
    title: '解决问题',
    body: '按阶段定位安装、认证与查询问题。',
    href: '/docs/products/cli/troubleshooting/',
  },
];

function QuickPaths(): ReactNode {
  return (
    <section className={styles.pathSection}>
      <div className="container">
        <div className={styles.pathHeading}>
          <BookOpenText
            aria-hidden="true"
            className={styles.pathHeadingIcon}
            size={20}
          />
          <Heading as="h2">按任务开始</Heading>
        </div>
        <div className={styles.pathGrid}>
          {paths.map((path) => (
            <Link className={styles.pathCard} href={path.href} key={path.step}>
              <span>{path.step}</span>
              <strong>{path.title}</strong>
              <small>{path.body}</small>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="MaxCompute 文档"
      description="MaxCompute CLI、MCP Server 与 Desktop 的统一产品文档入口，面向人与 AI Agent。"
    >
      <Hero />
      <Pillars />
      <main>
        <section className={styles.productsSection} id="products">
          <div className="container">
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.sectionLabel}>PRODUCTS</p>
                <Heading as="h2">选择产品</Heading>
              </div>
              <div className={styles.sectionIntro}>
                <p>按产品进入对应的文档与参考信息。</p>
                <Link to="/docs/products/">查看产品总览 →</Link>
              </div>
            </div>
            <ProductGrid />
          </div>
        </section>
        <QuickPaths />
      </main>
    </Layout>
  );
}
