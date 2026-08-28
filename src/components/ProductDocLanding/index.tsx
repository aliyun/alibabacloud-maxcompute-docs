import type {ReactNode} from 'react';
import {ArrowRight} from '@phosphor-icons/react';
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
  navigation: Array<{label: string; href: string}>;
};

export default function ProductDocLanding({
  productId,
}: {
  productId: string;
}): ReactNode {
  const product = (registry.products as ProductEntry[]).find(
    (entry) => entry.id === productId,
  );

  if (!product) return null;

  return (
    <div className={`${styles.landing} ${styles[product.accent]}`}>
      <section className={styles.hero}>
        <div className={styles.heroIcon}>
          <ProductIcon name={product.icon} size={34} />
        </div>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrowRow}>MAXCOMPUTE DOCUMENTATION</div>
          <Heading as="h1">{product.name}</Heading>
          <p>{product.description}</p>
        </div>
      </section>

      <section className={styles.paths}>
        {product.navigation.map((item, index) => (
          <Link key={item.href} to={item.href}>
            <span className={styles.pathIndex}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <strong>{item.label}</strong>
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        ))}
      </section>
    </div>
  );
}
