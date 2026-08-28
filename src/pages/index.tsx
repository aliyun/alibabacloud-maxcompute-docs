import type {ReactNode} from 'react';
import {ArrowRight} from '@phosphor-icons/react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {DocSearchTrigger} from '@site/src/components/DocSearch';
import ProductGrid from '@site/src/components/ProductGrid';

import styles from './index.module.css';

function HomepageHeader(): ReactNode {
  const heroAsset = useBaseUrl('/img/docs-products-hero.png');

  return (
    <header className={styles.heroBanner}>
      <img
        alt=""
        aria-hidden="true"
        className={styles.heroArtwork}
        src={heroAsset}
      />
      <div className={`container ${styles.heroInner}`}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>MAXCOMPUTE DOCUMENTATION</p>
          <Heading as="h1" className={styles.heroTitle}>
            MaxCompute 产品文档
          </Heading>
          <p className={styles.heroSubtitle}>
            CLI、MCP Server 与 Desktop
            的安装、配置、使用与故障排查信息，都可以从这里开始查找。
          </p>
          <div className={styles.heroActions}>
            <DocSearchTrigger variant="hero" />
            <a className={styles.primaryAction} href="#products">
              选择产品 <ArrowRight aria-hidden="true" size={18} />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="MaxCompute 产品文档"
      description="MaxCompute CLI、MCP Server 与 Desktop 的统一产品文档入口。"
    >
      <HomepageHeader />
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

        <section className={styles.resourceSection}>
          <div className={`container ${styles.resourceGrid}`}>
            <Link to="/docs/getting-started/">
              <span>01</span>
              <strong>第一次使用</strong>
              <small>了解文档边界与推荐路径</small>
            </Link>
            <Link to="/docs/best-practices/">
              <span>02</span>
              <strong>最佳实践</strong>
              <small>按场景查找可复用方案</small>
            </Link>
            <Link to="/docs/faq/">
              <span>03</span>
              <strong>常见问题</strong>
              <small>快速查找常见问题与说明</small>
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
