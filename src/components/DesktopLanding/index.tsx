import type {ReactNode} from 'react';
import {
  AppleLogo,
  ArrowRight,
  ArrowSquareOut,
  WindowsLogo,
} from '@phosphor-icons/react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import registry from '@site/config/products.json';
import ProductIcon from '@site/src/components/ProductIcon';

import styles from './styles.module.css';

const OFFICIAL_DOC_URL =
  'https://help.aliyun.com/zh/maxcompute/maxcompute-client-maxcompute-query-studio-user-guide';

type DownloadItem = {
  platform: string;
  requirement: string;
  file: string;
  url: string;
  icon: typeof AppleLogo;
};

const DOWNLOADS: DownloadItem[] = [
  {
    platform: 'macOS',
    requirement: 'macOS 12.3 及以上 · Apple Silicon',
    file: 'MaxCompute_aarch64.dmg',
    url: 'https://maxquery-updates.oss-cn-hangzhou.aliyuncs.com/maxquery-studio/latest/MaxCompute_aarch64.dmg',
    icon: AppleLogo,
  },
  {
    platform: 'Windows',
    requirement: 'Windows 10 及以上 · 64 位',
    file: 'MaxCompute_x64_zh-CN.msi',
    url: 'https://maxquery-updates.oss-cn-hangzhou.aliyuncs.com/maxquery-studio/latest/MaxCompute_x64_zh-CN.msi',
    icon: WindowsLogo,
  },
];

type ArchModule = {title: string; desc: string; href: string};

type ArchLayer = {label: string; desc: string; modules: ArchModule[]};

const DOC_BASE = '/docs/products/desktop';

const ARCH_LAYERS: ArchLayer[] = [
  {
    label: '数据工作台',
    desc: '连接数据源，取数、建模与可视化',
    modules: [
      {
        title: 'MaxCompute 连接',
        desc: '多地域多项目连接与切换',
        href: `${DOC_BASE}/connection/`,
      },
      {
        title: 'Hologres 与 StarRocks',
        desc: '多数据源接入与路由',
        href: `${DOC_BASE}/multi-datasource/`,
      },
      {
        title: 'OSS 文件管理',
        desc: 'Bucket 与文件管理查询',
        href: `${DOC_BASE}/oss-files/`,
      },
      {
        title: 'Catalog 与表洞察',
        desc: '结构浏览与规则化体检',
        href: `${DOC_BASE}/catalog-insights/`,
      },
      {
        title: 'SQL 分析',
        desc: '编写、执行与结果可视化',
        href: `${DOC_BASE}/sql-analysis/`,
      },
      {
        title: '数据看板',
        desc: 'Pin 成盘、联动与定时刷新',
        href: `${DOC_BASE}/dashboard/`,
      },
      {
        title: 'MaxFrame',
        desc: 'Python 大规模数据处理',
        href: `${DOC_BASE}/maxframe-notebook/`,
      },
      {
        title: 'UDF',
        desc: '函数编写、调试与注册',
        href: `${DOC_BASE}/python-udf/`,
      },
      {
        title: '数据导入',
        desc: 'CSV、Excel、Parquet 与 Blob',
        href: `${DOC_BASE}/data-import/`,
      },
    ],
  },
  {
    label: 'DataAgent',
    desc: '自然语言驱动的分析与归因',
    modules: [
      {
        title: 'AI Query',
        desc: 'Agent 规划执行的问答分析',
        href: `${DOC_BASE}/ai-query/`,
      },
      {
        title: '专家模式',
        desc: '指标归因与异常根因',
        href: `${DOC_BASE}/expert-mode/`,
      },
      {
        title: '语义包',
        desc: '业务术语与指标口径',
        href: `${DOC_BASE}/semantic-pack/`,
      },
    ],
  },
  {
    label: '多模态',
    desc: '多模态数据与内容创作',
    modules: [
      {
        title: '多模态管理',
        desc: 'Blob 浏览、预览与挂载',
        href: `${DOC_BASE}/multimodal-blob/`,
      },
      {
        title: 'AIGC',
        desc: '视频、音乐与 PPT 生成',
        href: `${DOC_BASE}/aigc-studio/`,
      },
    ],
  },
  {
    label: '扩展生态',
    desc: '连接更多引擎与工具',
    modules: [
      {
        title: 'OpenClaw 与 MCP',
        desc: '对外暴露与承接 Agent',
        href: `${DOC_BASE}/ecosystem/`,
      },
      {
        title: 'dbt',
        desc: '血缘与编译预览',
        href: `${DOC_BASE}/dbt-integration/`,
      },
      {
        title: '办公协作',
        desc: '结果分享到飞书文档',
        href: `${DOC_BASE}/office-collaboration/`,
      },
    ],
  },
];

const FOUNDATION = '阿里云 MaxCompute 云端服务 · 多地域项目';

type ProductEntry = {
  id: string;
  name: string;
  description: string;
  href: string;
  navigation: Array<{label: string; href: string}>;
};

export default function DesktopLanding(): ReactNode {
  const product = (registry.products as ProductEntry[]).find(
    (entry) => entry.id === 'desktop',
  );

  if (!product) return null;

  return (
    <div className={styles.landing}>
      <section className={styles.hero}>
        <div className={styles.heroIcon}>
          <ProductIcon name="desktop" size={34} />
        </div>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrowRow}>MAXCOMPUTE DOCUMENTATION</div>
          <Heading as="h1">{product.name}</Heading>
          <p className={styles.heroAlias}>MaxCompute Desktop</p>
          <p className={styles.heroIntro}>
            MaxCompute AI数据探索客户端是一款专为阿里云 MaxCompute
            打造的桌面端数据开发与分析工具，集成 SQL
            开发、数据管理、可视化分析和 AI 数据探索能力。
          </p>
          <p className={styles.heroIntro}>
            客户端运行于本地桌面环境，启动即连接云端 MaxCompute 项目；SQL
            脚本、连接配置、查询历史和 AI
            会话等状态在本地持久化，重开后可快速还原工作现场。
          </p>
          <div className={styles.ctaRow}>
            <Link className={styles.ctaPrimary} to={`${DOC_BASE}/quickstart/`}>
              快速开始
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
            <Link
              className={styles.ctaSecondary}
              href={OFFICIAL_DOC_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              官网产品文档
              <ArrowSquareOut aria-hidden="true" size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.downloads}>
        {DOWNLOADS.map((item) => (
          <Link
            key={item.platform}
            className={styles.downloadCard}
            href={item.url}
          >
            <item.icon aria-hidden="true" className={styles.downloadIcon} />
            <span className={styles.downloadCopy}>
              <strong>下载 {item.platform} 版</strong>
              <span className={styles.downloadMeta}>{item.requirement}</span>
              <span className={styles.downloadFile}>{item.file}</span>
            </span>
            <ArrowSquareOut aria-hidden="true" size={16} />
          </Link>
        ))}
      </section>
      <p className={styles.downloadNote}>
        安装与更新说明见<Link to={`${DOC_BASE}/installation/`}>安装与更新</Link>
        。更多产品文档见
        <Link href={OFFICIAL_DOC_URL} target="_blank" rel="noopener noreferrer">
          官网使用指南
        </Link>
        。
      </p>

      <section className={styles.architecture}>
        <Heading as="h2" className={styles.sectionTitle}>
          产品架构
        </Heading>
        <p className={styles.sectionDesc}>
          单击架构中的模块，进入对应的文档页面。
        </p>
        <div className={styles.archLayers}>
          {ARCH_LAYERS.map((layer) => (
            <div key={layer.label} className={styles.archLayer}>
              <div className={styles.archLayerLabel}>
                <strong>{layer.label}</strong>
                <span>{layer.desc}</span>
              </div>
              <div className={styles.archModules}>
                {layer.modules.map((module) => (
                  <Link
                    key={module.href}
                    to={module.href}
                    className={styles.archModule}
                  >
                    <strong>{module.title}</strong>
                    <span>{module.desc}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <div className={styles.archFoundation}>{FOUNDATION}</div>
        </div>
      </section>
    </div>
  );
}
