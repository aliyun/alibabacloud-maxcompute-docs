import type {ReactNode} from 'react';
import {ArrowRight, Sparkle} from '@phosphor-icons/react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import registry from '@site/config/products.json';
import {
  productCategories,
  type ProductCategory,
} from '@site/src/config/product-categories';
import ProductIcon, {
  type ProductIconName,
} from '@site/src/components/ProductIcon';
import {useReveal} from '@site/src/lib/motion';

import styles from './styles.module.css';

type ProductEntry = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  href: string;
  icon: ProductIconName;
  accent: 'orange' | 'blue' | 'violet' | 'green' | 'cyan' | 'amber' | 'emerald';
  category?: 'ai' | 'interface' | 'connector';
  featured: boolean;
  navigation: Array<{label: string; href: string}>;
};

function CategoryHeader({
  label,
  description,
  gradient,
}: {
  label: string;
  description: string;
  gradient: string;
}): ReactNode {
  return (
    <div className={`${styles.categoryHeader} ${styles[gradient]}`}>
      <Sparkle aria-hidden="true" size={16} weight="fill" />
      <div>
        <strong>{label}</strong>
        <span>{description}</span>
      </div>
    </div>
  );
}

function ProductCard({product}: {product: ProductEntry}): ReactNode {
  return (
    <article className={`${styles.productCard} ${styles[product.accent]}`}>
      <div className={styles.productCardTop}>
        <span className={styles.productCardIcon}>
          <ProductIcon name={product.icon} size={28} />
        </span>
        <span className={styles.productCardTag}>{product.shortName}</span>
      </div>
      <Heading as="h3">
        <Link to={product.href}>{product.name}</Link>
      </Heading>
      <p>{product.description}</p>
      <div className={styles.productCardLinks}>
        {product.navigation.slice(0, 2).map((item) => (
          <Link key={item.href} to={item.href}>
            {item.label}
          </Link>
        ))}
      </div>
      <Link className={styles.productCardOpen} to={product.href}>
        进入文档 <ArrowRight aria-hidden="true" size={14} />
      </Link>
    </article>
  );
}

function PlaceholderCard({
  item,
}: {
  item: ProductCategory['items'][number];
}): ReactNode {
  const content = (
    <>
      <div className={styles.placeholderTop}>
        <span className={styles.placeholderIcon}>
          <ProductIcon name={item.icon} size={24} />
        </span>
        <span className={styles.placeholderBadge}>即将上线</span>
      </div>
      <Heading as="h4">{item.label}</Heading>
    </>
  );

  return item.external ? (
    <a
      className={`${styles.placeholderCard} ${styles[item.accent]}`}
      href={item.href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {content}
    </a>
  ) : (
    <span className={`${styles.placeholderCard} ${styles[item.accent]}`}>
      {content}
    </span>
  );
}

function CategoryCard({category}: {category: ProductCategory}): ReactNode {
  const products = (registry.products as ProductEntry[]).filter(
    (product) => product.featured && product.category === category.id,
  );
  const realIds = new Set(products.map((p) => p.id));
  const placeholders = category.items.filter((item) => !realIds.has(item.id));

  return (
    <section className={`${styles.categoryCard} ${styles[category.gradient]}`}>
      <CategoryHeader
        description={category.description}
        gradient={category.gradient}
        label={category.label}
      />
      <div className={styles.productGrid}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {placeholders.map((item) => (
          <PlaceholderCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export default function ProductGrid({
  compact = false,
}: {
  compact?: boolean;
}): ReactNode {
  const gridRef = useReveal<HTMLDivElement>(':scope > *', {
    y: 34,
    stagger: 0.1,
    start: 'top 86%',
  });

  return (
    <div
      className={`${styles.grid} ${compact ? styles.compact : ''}`}
      ref={gridRef}
    >
      {productCategories.map((category) => (
        <CategoryCard category={category} key={category.id} />
      ))}
    </div>
  );
}
