import type {ReactNode} from 'react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ArrowRight, MagnifyingGlass, X} from '@phosphor-icons/react';
import Link from '@docusaurus/Link';
import generatedSearchIndex from '@site/src/generated/search-index.json';

import styles from './styles.module.css';

type SearchEntry = {
  title: string;
  description: string;
  href: string;
  group: string;
  keywords: string;
};

const siteEntries: SearchEntry[] = [
  {
    title: 'MaxCompute 文档首页',
    description: '浏览产品文档、最佳实践和常见问题。',
    href: '/',
    group: 'MaxCompute 文档',
    keywords: '产品文档 最佳实践 常见问题 更新日志',
  },
];

const searchEntries: SearchEntry[] = [
  ...siteEntries,
  ...(generatedSearchIndex as SearchEntry[]),
];

type DocSearchTriggerProps = {
  variant?: 'navbar' | 'hero';
  mobile?: boolean;
  onClick?: () => void;
};

export function DocSearchTrigger({
  variant = 'navbar',
  mobile = false,
  onClick,
}: DocSearchTriggerProps): ReactNode {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    onClick?.();
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, [onClick]);

  useEffect(() => {
    if (!open) return undefined;
    inputRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [close, open]);

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('zh-CN');
    if (!normalized) return searchEntries.slice(0, 8);
    return searchEntries
      .filter((entry) =>
        `${entry.title} ${entry.description} ${entry.group} ${entry.keywords}`
          .toLocaleLowerCase('zh-CN')
          .includes(normalized),
      )
      .slice(0, 10);
  }, [query]);

  return (
    <>
      <button
        className={`${styles.trigger} ${styles[variant]} ${mobile ? styles.mobile : ''}`}
        onClick={() => setOpen(true)}
        ref={triggerRef}
        type="button"
      >
        <MagnifyingGlass aria-hidden="true" size={18} weight="bold" />
        <span>{variant === 'hero' ? '搜索产品、指南和参考' : '搜索文档'}</span>
      </button>

      {open ? (
        <div className={styles.overlay} onMouseDown={close}>
          <section
            aria-label="搜索 MaxCompute 文档"
            aria-modal="true"
            className={styles.dialog}
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className={styles.searchBox}>
              <MagnifyingGlass aria-hidden="true" size={22} />
              <input
                aria-label="搜索关键词"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索产品、指南和参考"
                ref={inputRef}
                type="search"
                value={query}
              />
              <button aria-label="关闭搜索" onClick={close} type="button">
                <X aria-hidden="true" size={18} />
              </button>
            </div>

            <div aria-live="polite" className={styles.results}>
              {results.length > 0 ? (
                results.map((entry) => (
                  <Link key={entry.href} onClick={close} to={entry.href}>
                    <span className={styles.resultGroup}>{entry.group}</span>
                    <span className={styles.resultCopy}>
                      <strong>{entry.title}</strong>
                      <small>{entry.description}</small>
                    </span>
                    <ArrowRight aria-hidden="true" size={17} />
                  </Link>
                ))
              ) : (
                <div className={styles.empty}>
                  <strong>没有找到匹配页面</strong>
                  <span>试试产品名称、快速开始或故障排查。</span>
                </div>
              )}
            </div>
            <footer className={styles.footer}>
              <span>搜索当前产品文档与公共资源。</span>
              <Link onClick={close} to="/docs/products/">
                浏览全部产品
              </Link>
            </footer>
          </section>
        </div>
      ) : null}
    </>
  );
}

export default function NavbarDocSearch(
  props: Omit<DocSearchTriggerProps, 'variant'>,
): ReactNode {
  if (props.mobile) {
    return (
      <li className="menu__list-item">
        <DocSearchTrigger {...props} variant="navbar" />
      </li>
    );
  }

  return <DocSearchTrigger {...props} variant="navbar" />;
}
