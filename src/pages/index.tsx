import type {ReactNode} from 'react';
import {useRef, useState} from 'react';
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
import {
  EASE_OUT,
  ensureGsap,
  prefersReducedMotion,
  useGsap,
  useIsomorphicLayoutEffect,
  useReveal,
} from '@site/src/lib/motion';

import styles from './index.module.css';
import registry from '@site/config/products.json';
import searchIndex from '@site/src/generated/search-index.json';

const SHOWCASE_CYCLE = 6;

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
      <img
        className={styles.desktopFrame}
        src="img/maxquery-studio-product-frame-light-en.svg"
        alt="MaxCompute AI数据探索客户端产品界面"
      />
    </div>
  );
}

const showcases = [
  {
    id: 'desktop',
    label: 'Desktop',
    icon: <Desktop aria-hidden="true" size={15} weight="bold" />,
    caption: '桌面级 DataAgent · 可视化数据工作台',
    panel: <DesktopPanel />,
  },
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
];

function Showcase(): ReactNode {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const firstPaint = useRef(true);

  // Autoplay and the progress bar share one tween so they never drift apart.
  useGsap(
    ({gsap}) => {
      if (prefersReducedMotion()) return;
      const bar = barRef.current;
      if (!bar) return;
      const tween = gsap.fromTo(
        bar,
        {scaleX: 0},
        {
          scaleX: 1,
          duration: SHOWCASE_CYCLE,
          ease: 'none',
          onComplete: () =>
            setActive((value) => (value + 1) % showcases.length),
        },
      );
      if (paused) tween.pause();
    },
    {deps: [active, paused]},
  );

  // Cross-fade the incoming panel (skip the initial one — the hero handles it).
  useIsomorphicLayoutEffect(() => {
    if (firstPaint.current) {
      firstPaint.current = false;
      return undefined;
    }
    if (prefersReducedMotion()) return undefined;
    const panel = stageRef.current?.querySelector<HTMLElement>(
      `[data-panel="${active}"]`,
    );
    if (!panel) return undefined;
    const {gsap} = ensureGsap();
    const tween = gsap.fromTo(
      panel,
      {autoAlpha: 0, y: 16},
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.55,
        ease: EASE_OUT,
        clearProps: 'opacity,visibility,transform',
      },
    );
    return () => {
      tween.kill();
    };
  }, [active]);

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
      <span aria-hidden="true" className={styles.showcaseProgress}>
        <span className={styles.showcaseProgressBar} ref={barRef} />
      </span>
      <div className={styles.showcaseStage} ref={stageRef}>
        {showcases.map((item, index) => (
          <div
            aria-hidden={active !== index}
            className={`${styles.showcasePanel} ${
              active === index ? styles.showcasePanelActive : ''
            }`}
            data-panel={index}
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
  const heroRef = useRef<HTMLElement>(null);
  const showcaseClass = styles.showcase;

  useGsap(
    ({gsap}) => {
      if (prefersReducedMotion()) return;

      const tl = gsap.timeline({defaults: {ease: EASE_OUT, duration: 0.7}});
      tl.from(`.${styles.heroCopy} > *`, {
        y: 22,
        autoAlpha: 0,
        stagger: 0.1,
      }).from(
        `.${showcaseClass}`,
        {y: 32, autoAlpha: 0, duration: 0.85},
        '-=0.55',
      );

      gsap.to(`.${styles.heroGlow}`, {
        yPercent: 16,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    },
    {scope: heroRef},
  );

  return (
    <header className={styles.hero} ref={heroRef}>
      <div aria-hidden="true" className={styles.heroGrid} />
      <div aria-hidden="true" className={styles.heroGlow} />
      <div aria-hidden="true" className={styles.heroOrbs} />
      <div className={`container ${styles.heroInner}`}>
        <div className={styles.heroCopy}>
          <span className={styles.badge}>MAXCOMPUTE DOCS</span>
          <Heading as="h1" className={styles.heroTitle}>
            从第一条查询开始
            <span className={styles.heroProductLine}>连接 MaxCompute</span>
          </Heading>
          <p className={styles.heroSubtitle}>
            先准备项目和身份，再运行不依赖业务表的查询。已有工程？按任务选择客户端、驱动或连接器。
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} to="/docs/getting-started/">
              第一次使用 <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <DocSearchTrigger variant="hero" />
          </div>
          <dl className={styles.heroStats}>
            <div>
              <dt>{registry.products.length}</dt>
              <dd>产品文档</dd>
            </div>
            <div>
              <dt>{searchIndex.length}</dt>
              <dd>篇文档（含草稿）</dd>
            </div>
            <div>
              <dt>3</dt>
              <dd>大分类</dd>
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
    step: '01 · 准备',
    title: '还没有可用项目',
    body: '确认账号、项目、身份、地域与费用范围。',
    href: '/docs/getting-started/prepare/',
  },
  {
    step: '02 · 查询',
    title: '执行第一条查询',
    body: '不创建表，核对一行确定的结果，再分析内联样例。',
    href: '/docs/getting-started/first-query/',
  },
  {
    step: '03 · 选择',
    title: '连接自己的工具',
    body: '按图形界面、程序接口或计算工程选择一条路径。',
    href: '/docs/getting-started/client-selection/',
  },
  {
    step: '04 · 恢复',
    title: '遇到错误怎么处理',
    body: '按安装、连接、权限、执行与结果读取定位问题。',
    href: '/docs/faq/',
  },
];

function QuickPaths(): ReactNode {
  const gridRef = useReveal<HTMLDivElement>(':scope > *', {
    y: 28,
    stagger: 0.08,
    start: 'top 88%',
  });

  return (
    <section className={styles.pathSection}>
      <div className="container">
        <div className={styles.pathHeading}>
          <BookOpenText
            aria-hidden="true"
            className={styles.pathHeadingIcon}
            size={20}
          />
          <Heading as="h2">按你现在的任务开始</Heading>
        </div>
        <div className={styles.pathGrid} ref={gridRef}>
          {paths.map((path) => (
            <Link className={styles.pathCard} to={path.href} key={path.step}>
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
      description="MaxCompute 产品文档中心，覆盖 SDK、JDBC、ODBC、Spark、dbt、CLI、MCP Server、Desktop、Flink Connector 等产品，面向开发者与 AI Agent。"
    >
      <Hero />
      <main>
        <QuickPaths />
        <section className={styles.productsSection} id="products">
          <div className="container">
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.sectionLabel}>PRODUCTS</p>
                <Heading as="h2">选择产品</Heading>
              </div>
              <div className={styles.sectionIntro}>
                <p>已确定工具时，从这里进入快速开始和参考。</p>
                <Link to="/docs/products/">查看产品总览 →</Link>
              </div>
            </div>
            <ProductGrid />
          </div>
        </section>
      </main>
    </Layout>
  );
}
