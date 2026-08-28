import type {ReactNode} from 'react';
import {ArrowRight, SquaresFour} from '@phosphor-icons/react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import registry from '@site/config/products.json';
import ProductIcon, {
  type ProductIconName,
} from '@site/src/components/ProductIcon';

import styles from './styles.module.css';

type ProductEntry = {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: ProductIconName;
  accent: 'orange' | 'blue' | 'violet' | 'green';
  featured: boolean;
  navigation: Array<{label: string; href: string}>;
};

export default function ProductGrid(): ReactNode {
  const products = (registry.products as ProductEntry[]).filter(
    (product) => product.featured,
  );

  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <article
          className={`${styles.card} ${styles[product.accent]}`}
          key={product.id}
        >
          <div className={styles.cardTop}>
            <span className={styles.icon}>
              <ProductIcon name={product.icon} size={30} />
            </span>
          </div>
          <Heading as="h3">
            <Link to={product.href}>{product.name}</Link>
          </Heading>
          <p>{product.description}</p>
          <div className={styles.quickLinks}>
            {product.navigation.slice(0, 2).map((item) => (
              <Link key={item.href} to={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
          <Link className={styles.open} to={product.href}>
            进入产品文档 <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </article>
      ))}

      <aside className={styles.futureCard} aria-label="更多产品">
        <span className={styles.futureIcon}>
          <SquaresFour aria-hidden="true" size={27} weight="regular" />
        </span>
        <Heading as="h3">探索更多产品</Heading>
        <p>在产品目录中查找适合当前任务的 MaxCompute 产品文档。</p>
        <Link to="/docs/products/">查看全部产品</Link>
      </aside>
    </div>
  );
}
