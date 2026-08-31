import type {ReactNode} from 'react';
import {useEffect, useState} from 'react';
import {
  ArrowRight,
  BookOpenText,
  Desktop,
  PlugsConnected,
  Terminal,
} from '@phosphor-icons/react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {DocSearchTrigger} from '@site/src/components/DocSearch';
import ProductGrid from '@site/src/components/ProductGrid';

import styles from './index.module.css';

function CliPanel(): ReactNode {
  return (
    <div className={`${styles.window} ${styles.windowDark}`}>
      <div className={styles.windowBar}>
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

function McpPanel(): ReactNode {
  return (
    <div className={`${styles.window} ${styles.windowDark}`}>
      <div className={styles.windowBar}>
        <i />
        <i />
        <i />
        <em>mcp-server · tools/call</em>
      </div>
      <div className={styles.terminalBody}>
        <p className={styles.tDim}># Agent 通过 MCP 协议调用</p>
        <p className={styles.tJson}>{'{'}</p>
        <p className={styles.tJson}>
          {'  '}
          <span className={styles.tKey}>&quot;method&quot;</span>:{' '}
          <span className={styles.tStr}>&quot;tools/call&quot;</span>,
        </p>
        <p className={styles.tJson}>
          {'  '}
          <span className={styles.tKey}>&quot;params&quot;</span>: {'{'}
        </p>
        <p className={styles.tJson}>
          {'    '}
          <span className={styles.tKey}>&quot;name&quot;</span>:{' '}
          <span className={styles.tStr}>&quot;maxcompute_query&quot;</span>,
        </p>
        <p className={styles.tJson}>
          {'    '}
          <span className={styles.tKey}>&quot;arguments&quot;</span>: {'{'}
          <span className={styles.tKey}>&quot;sql&quot;</span>:{' '}
          <span className={styles.tStr}>&quot;SELECT …&quot;</span>
          {' }'}
        </p>
        <p className={styles.tJson}>{'  }'}</p>
        <p className={styles.tJson}>{'}'}</p>
        <p className={styles.tOk}>
          ✓ 200 OK <span className={styles.tDim}>· 结构化结果返回 Agent</span>
        </p>
      </div>
    </div>
  );
}

function DesktopPanel(): ReactNode {
  return (
    <div className={`${styles.window} ${styles.windowLight}`}>
      <div className={styles.windowBar}>
        <i />
        <i />
        <i />
        <em>MaxCompute Desktop</em>
      </div>
      <div className={styles.desktopBody}>
        <div className={styles.desktopSide}>
          <span className={styles.desktopSideActive}>SQL 工作台</span>
          <span>数据资产</span>
          <span>作业历史</span>
          <span>Data Agent</span>
        </div>
        <div className={styles.desktopMain}>
          <div className={styles.desktopEditor}>
            <p>
              <span className={styles.tKw}>SELECT</span> user_id, amount
            </p>
            <p>
              <span className={styles.tKw}>FROM</span> sales
            </p>
            <p>
              <span className={styles.tKw}>WHERE</span> ds =
              &apos;20260831&apos;
            </p>
          </div>
          <div className={styles.desktopGrid}>
            <div className={styles.desktopGridHead}>
              <span>user_id</span>
              <span>amount</span>
            </div>
            {['u_10021', 'u_10022', 'u_10023'].map((id, i) => (
              <div className={styles.desktopGridRow} key={id}>
                <span>{id}</span>
                <span>{[326.5, 89.0, 1204.75][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const showcases = [
  {
    id: 'cli',
    label: 'CLI',
    icon: <Terminal aria-hidden="true" size={15} weight="bold" />,
    caption: '命令行 · 结构化 JSON 输出',
    panel: <CliPanel />,
  },
  {
    id: 'mcp-server',
    label: 'MCP Server',
    icon: <PlugsConnected aria-hidden="true" size={15} weight="bold" />,
    caption: '标准协议 · 远程 Agent 接入',
    panel: <McpPanel />,
  },
  {
    id: 'desktop',
    label: 'Desktop',
    icon: <Desktop aria-hidden="true" size={15} weight="bold" />,
    caption: '桌面端 · 可视化数据工作台',
    panel: <DesktopPanel />,
  },
];

function Showcase(): ReactNode {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return undefined;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined;
    }
    const timer = window.setInterval(
      () => setActive((value) => (value + 1) % showcases.length),
      6000,
    );
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <div
      className={styles.showcase}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={styles.showcaseTabs} role="tablist">
        {showcases.map((item, index) => (
          <button
            aria-selected={active === index}
            className={`${styles.showcaseTab} ${
              active === index ? styles.showcaseTabActive : ''
            }`}
            key={item.id}
            onClick={() => setActive(index)}
            role="tab"
            type="button"
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
      <div className={styles.showcaseStage}>
        {showcases.map((item, index) => (
          <div
            aria-hidden={active !== index}
            className={`${styles.showcasePanel} ${
              active === index ? styles.showcasePanelActive : ''
            }`}
            key={item.id}
          >
            {item.panel}
          </div>
        ))}
      </div>
      <p className={styles.showcaseCaption}>{showcases[active].caption}</p>
    </div>
  );
}

function Hero(): ReactNode {
  return (
    <header className={styles.hero}>
      <div aria-hidden="true" className={styles.heroGlow} />
      <div className={`container ${styles.heroInner}`}>
        <div className={styles.heroCopy}>
          <span className={styles.badge}>MAXCOMPUTE DOCS</span>
          <Heading as="h1" className={styles.heroTitle}>
            给人用，也给 Agent 用的 MaxCompute 文档
          </Heading>
          <p className={styles.heroSubtitle}>
            CLI、MCP Server 与 Desktop
            的统一文档入口。命令行、协议与桌面三种形态，共享同一套 MaxCompute
            数据底座。
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} to="/docs/products/">
              浏览全部产品 <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <DocSearchTrigger variant="hero" />
          </div>
          <dl className={styles.heroStats}>
            <div>
              <dt>3</dt>
              <dd>产品形态</dd>
            </div>
            <div>
              <dt>36+</dt>
              <dd>篇文档</dd>
            </div>
            <div>
              <dt>4</dt>
              <dd>资源板块</dd>
            </div>
          </dl>
        </div>
        <Showcase />
      </div>
    </header>
  );
}

const paths = [
  {
    step: 'CLI',
    title: '命令行快速开始',
    body: '安装 maxc、完成认证、跑通第一条查询。',
    href: '/docs/products/cli/quickstart/',
  },
  {
    step: 'MCP',
    title: 'MCP Server 快速开始',
    body: '通过标准协议把 MaxCompute 能力暴露给 Agent。',
    href: '/docs/products/mcp-server/quickstart/',
  },
  {
    step: 'Desktop',
    title: 'Desktop 快速开始',
    body: '桌面端 SQL 工作台与可视化管理。',
    href: '/docs/products/desktop/quickstart/',
  },
  {
    step: '实践',
    title: '最佳实践',
    body: '场景化的落地方法与经验总结。',
    href: '/docs/best-practices/',
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
          <Heading as="h2">按产品开始</Heading>
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
