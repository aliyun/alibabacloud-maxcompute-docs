import type {MouseEvent, ReactNode} from 'react';
import {useEffect, useRef, useState} from 'react';
import {CaretDown, Plus} from '@phosphor-icons/react';
import Link from '@docusaurus/Link';
import registry from '@site/config/products.json';
import {productCategories} from '@site/src/config/product-categories';
import ProductIcon, {
  type ProductIconName,
} from '@site/src/components/ProductIcon';
import {
  EASE_OUT,
  ensureGsap,
  prefersReducedMotion,
  useIsomorphicLayoutEffect,
} from '@site/src/lib/motion';

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
  navigation: Array<{label: string; href: string}>;
};

type NavbarProductMenuProps = {
  label?: string;
  mobile?: boolean;
  onClick?: () => void;
};

const categoryGradient: Record<string, string> = {
  ai: 'violet',
  interface: 'cyan',
  connector: 'amber',
};

export default function NavbarProductMenu({
  label = '产品文档',
  mobile = false,
  onClick,
}: NavbarProductMenuProps): ReactNode {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const products = registry.products as ProductEntry[];

  useIsomorphicLayoutEffect(() => {
    if (!open) return undefined;
    const panel = mobile ? mobilePanelRef.current : panelRef.current;
    if (!panel || prefersReducedMotion()) return undefined;
    const {gsap} = ensureGsap();
    const columns = panel.querySelectorAll(
      `.${styles.productColumn}, .${styles.categoryColumn}, .${styles.expansionColumn}, .${styles.mobileProduct}`,
    );
    const ctx = gsap.context(() => {
      gsap.from(panel, {y: -10, autoAlpha: 0, duration: 0.3, ease: EASE_OUT});
      gsap.from(columns, {
        y: 12,
        autoAlpha: 0,
        duration: 0.36,
        ease: EASE_OUT,
        stagger: 0.05,
        delay: 0.04,
        clearProps: 'opacity,visibility,transform',
      });
    }, panel);
    return () => ctx.revert();
  }, [mobile, open]);

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

  const productsByCategory = (categoryId: string) =>
    products.filter((product) => product.category === categoryId);

  const placeholdersByCategory = (categoryId: string) => {
    const realIds = new Set(productsByCategory(categoryId).map((p) => p.id));
    const category = productCategories.find((c) => c.id === categoryId);
    return category?.items.filter((item) => !realIds.has(item.id)) ?? [];
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
            <div className={styles.mobilePanel} ref={mobilePanelRef}>
              {productCategories.map((category) => (
                <section className={styles.mobileCategory} key={category.id}>
                  <strong>{category.label}</strong>
                  {productsByCategory(category.id).map((product) => (
                    <Link
                      key={product.id}
                      onClick={closeAfterNavigation}
                      to={product.href}
                    >
                      {product.name}
                    </Link>
                  ))}
                  {placeholdersByCategory(category.id).map((item) =>
                    item.external ? (
                      <a
                        href={item.href}
                        key={item.id}
                        onClick={closeAfterNavigation}
                      >
                        {item.label} 官方文档 ↗
                      </a>
                    ) : (
                      <span className={styles.mobileComingSoon} key={item.id}>
                        {item.label}
                      </span>
                    ),
                  )}
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
          <div className={styles.panelGrid} ref={panelRef}>
            {productCategories.map((category) => (
              <section
                className={`${styles.categoryColumn} ${styles[categoryGradient[category.id]]}`}
                key={category.id}
              >
                <div className={styles.categoryHeader}>
                  <span>{category.label}</span>
                  <small>{category.description}</small>
                </div>
                {productsByCategory(category.id).map((product) => (
                  <div
                    className={`${styles.productColumn} ${styles[product.accent]}`}
                    key={product.id}
                  >
                    <div className={styles.productHeading}>
                      <span className={styles.productIcon}>
                        <ProductIcon name={product.icon} size={22} />
                      </span>
                      <Link to={product.href}>{product.name}</Link>
                    </div>
                    <div className={styles.productLinks}>
                      {product.navigation.slice(0, 4).map((item) => (
                        <Link key={item.href} to={item.href}>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
                <div className={styles.placeholderList}>
                  {placeholdersByCategory(category.id).map((item) => {
                    const content = (
                      <>
                        <ProductIcon name={item.icon} size={18} />
                        {item.label}
                        <small>
                          {item.external ? '官方文档 ↗' : '即将上线'}
                        </small>
                      </>
                    );
                    const className = `${styles.placeholderItem} ${styles[item.accent]}`;
                    return item.external ? (
                      <a className={className} href={item.href} key={item.id}>
                        {content}
                      </a>
                    ) : (
                      <span className={className} key={item.id}>
                        {content}
                      </span>
                    );
                  })}
                </div>
              </section>
            ))}

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
