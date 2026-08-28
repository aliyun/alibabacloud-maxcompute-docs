import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import ComponentGrid from '@site/src/components/ComponentGrid';
import registry from '@site/config/components.json';
import packageMetadata from '@site/package.json';

import styles from './index.module.css';

function HomepageHeader(): ReactNode {
  return (
    <header className={styles.heroBanner}>
      <div className={`container ${styles.heroInner}`}>
        <p className={styles.eyebrow}>MAXCOMPUTE DOCUMENTATION</p>
        <Heading as="h1" className={styles.heroTitle}>
          一个入口，承载 MaxCompute 多组件文档
        </Heading>
        <p className={styles.heroSubtitle}>
          统一目录、贡献契约和质量门禁，让组件团队可以独立维护内容，让读者可以按任务快速定位文档。
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            to="/docs/components/"
          >
            浏览组件文档
          </Link>
          <Link
            className="button button--outline button--primary button--lg"
            to="/docs/contributing/"
          >
            参与贡献
          </Link>
        </div>
        <div className={styles.facts} aria-label="平台基线">
          <div>
            <strong>{registry.components.length}</strong>
            <span>个组件入口</span>
          </div>
          <div>
            <strong>1</strong>
            <span>套统一贡献契约</span>
          </div>
          <div>
            <strong>{packageMetadata.dependencies['@docusaurus/core']}</strong>
            <span>Docusaurus 基线</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="MaxCompute 多组件文档平台"
      description="MaxCompute 核心产品、SDK、连接器和开发工具的统一文档入口。"
    >
      <HomepageHeader />
      <main>
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.sectionLabel}>COMPONENTS</p>
                <Heading as="h2">按组件浏览</Heading>
              </div>
              <Link to="/docs/components/">查看组件总览 →</Link>
            </div>
            <ComponentGrid />
          </div>
        </section>

        <section className={styles.pathSection}>
          <div className="container">
            <p className={styles.sectionLabel}>QUICK PATHS</p>
            <Heading as="h2">从当前任务开始</Heading>
            <div className={styles.pathGrid}>
              <Link className={styles.pathCard} to="/docs/intro/">
                <span>01</span>
                <Heading as="h3">第一次使用</Heading>
                <p>了解内容边界、页面状态和推荐阅读路径。</p>
              </Link>
              <Link className={styles.pathCard} to="/docs/best-practices/">
                <span>02</span>
                <Heading as="h3">查找跨组件方案</Heading>
                <p>从经过验证的实践中查找场景、步骤和限制。</p>
              </Link>
              <Link className={styles.pathCard} to="/docs/contributing/">
                <span>03</span>
                <Heading as="h3">提交文档</Heading>
                <p>使用模板、注册表和 CI 契约完成可评审的变更。</p>
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.platformSection}>
          <div className={`container ${styles.platformGrid}`}>
            <div>
              <p className={styles.sectionLabel}>PLATFORM</p>
              <Heading as="h2">为多人协作准备的仓库基线</Heading>
              <p>
                组件注册表驱动首页入口，自动侧栏承载目录扩展，文档模板统一页面结构，GitLab
                CI 在合并前检查格式、元数据、所有权契约和生产构建。
              </p>
            </div>
            <div className={styles.platformLinks}>
              <Link to="/docs/platform/architecture/">了解平台架构</Link>
              <Link to="/docs/contributing/add-component/">接入新组件</Link>
              <Link to="/docs/platform/versioning/">查看版本策略</Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
