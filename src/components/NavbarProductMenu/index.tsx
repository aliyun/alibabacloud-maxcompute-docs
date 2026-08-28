import type {MouseEvent, ReactNode} from 'react';
import {useEffect, useRef, useState} from 'react';
import {CaretDown, Plus} from '@phosphor-icons/react';
import Link from '@docusaurus/Link';
import registry from '@site/config/products.json';
import ProductIcon, {
  type ProductIconName,
} from '@site/src/components/ProductIcon';

import styles from './styles.module.css';

type ProductEntry = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  href: string;
  icon: ProductIconName;
  accent: 'orange' | 'blue' | 'violet' | 'green';
  navigation: Array<{label: string; href: string}>;
};

type NavbarProductMenuProps = {
  label?: string;
  mobile?: boolean;
  onClick?: () => void;
};

export default function NavbarProductMenu({
  label = '产品文档',
  mobile = false,
  onClick,
}: NavbarProductMenuProps): ReactNode {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const products = registry.products as ProductEntry[];

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [open]);

  const closeAfterNavigation = () => {
    setOpen(false);
    onClick?.();
  };

  const toggle = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setOpen((value) => !value);
  };

  if (mobile) {
    return (
      <li className={styles.mobileListItem}>
        <div className={styles.mobileRoot} ref={rootRef}>
          <button
            aria-expanded={open}
            className={styles.mobileTrigger}
            onClick={toggle}
            type="button"
          >
            {label}
            <CaretDown
              aria-hidden="true"
              className={open ? styles.caretOpen : undefined}
              size={16}
            />
          </button>
          {open ? (
            <div className={styles.mobilePanel}>
              {products.map((product) => (
                <section className={styles.mobileProduct} key={product.id}>
                  <Link onClick={closeAfterNavigation} to={product.href}>
                    {product.name}
                  </Link>
                  {product.navigation.map((item) => (
                    <Link
                      key={item.href}
                      onClick={closeAfterNavigation}
                      to={item.href}
                    >
                      {item.label}
                    </Link>
                  ))}
                </section>
              ))}
              <Link
                className={styles.mobileAllProducts}
                onClick={closeAfterNavigation}
                to="/docs/products/"
              >
                查看产品总览
              </Link>
            </div>
          ) : null}
        </div>
      </li>
    );
  }

  return (
    <div
      className={styles.root}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      ref={rootRef}
    >
      <button
        aria-expanded={open}
        className={`navbar__link ${styles.trigger} ${open ? styles.active : ''}`}
        onClick={toggle}
        type="button"
      >
        {label}
        <span className={styles.activeDot} aria-hidden="true" />
        <CaretDown
          aria-hidden="true"
          className={open ? styles.caretOpen : undefined}
          size={15}
        />
      </button>

      {open ? (
        <div className={styles.panel}>
          <div className={styles.panelGrid}>
            <div className={styles.productsGrid}>
              {products.map((product) => (
                <section
                  className={`${styles.productColumn} ${styles[product.accent]}`}
                  key={product.id}
                >
                  <div className={styles.productHeading}>
                    <span className={styles.productIcon}>
                      <ProductIcon name={product.icon} size={26} />
                    </span>
                    <div>
                      <span className={styles.groupLabel}>产品文档</span>
                      <Link to={product.href}>{product.name}</Link>
                    </div>
                  </div>
                  <p>{product.description}</p>
                  <div className={styles.productLinks}>
                    {product.navigation.map((item) => (
                      <Link key={item.href} to={item.href}>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <aside className={styles.expansionColumn}>
              <span className={styles.expansionIcon}>
                <Plus aria-hidden="true" size={24} />
              </span>
              <span className={styles.groupLabel}>产品目录</span>
              <strong>探索更多产品</strong>
              <p>从统一目录查找适合当前任务的产品文档。</p>
              <Link to="/docs/products/">查看全部产品</Link>
            </aside>
          </div>
        </div>
      ) : null}
    </div>
  );
}
