import type {ReactNode} from 'react';
import {ArrowRight} from '@phosphor-icons/react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import registry from '@site/config/products.json';
import ProductIcon, {
  type ProductIconName,
} from '@site/src/components/ProductIcon';
import {useReveal} from '@site/src/lib/motion';

import styles from './styles.module.css';

type ProductEntry = {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: ProductIconName;
  accent: 'orange' | 'blue' | 'violet' | 'green' | 'cyan' | 'amber' | 'emerald';
  navigation: Array<{label: string; href: string}>;
};

export default function ProductDocLanding({
  productId,
}: {
  productId: string;
}): ReactNode {
  const heroRef = useReveal<HTMLElement>(':scope > *', {
    y: 22,
    stagger: 0.09,
    start: 'top 88%',
  });
  const pathsRef = useReveal<HTMLElement>(':scope > *', {
    y: 24,
    stagger: 0.06,
    start: 'top 90%',
  });
  const product = (registry.products as ProductEntry[]).find(
    (entry) => entry.id === productId,
  );

  if (!product) return null;

  return (
    <div className={styles.landing} data-product-accent={product.accent}>
      <section className={styles.hero} ref={heroRef}>
        <div className={styles.heroIcon}>
          <ProductIcon name={product.icon} size={34} />
        </div>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrowRow}>MAXCOMPUTE DOCUMENTATION</div>
          <Heading as="h1">{product.name}</Heading>
          <p>{product.description}</p>
        </div>
      </section>

      <section className={styles.paths} ref={pathsRef}>
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
