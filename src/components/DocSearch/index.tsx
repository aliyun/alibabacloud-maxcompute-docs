import type {ReactNode} from 'react';
import {useCallback, useEffect, useId, useMemo, useRef, useState} from 'react';
import {ArrowRight, MagnifyingGlass, X} from '@phosphor-icons/react';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import registry from '@site/config/products.json';
import generatedSearchIndex from '@site/src/generated/search-index.json';
import {
  searchDocs,
  searchTerms,
  searchKeyAction,
  type SearchEntry,
} from '@site/src/lib/doc-search';
import {
  EASE_OUT,
  ensureGsap,
  prefersReducedMotion,
  useIsomorphicLayoutEffect,
} from '@site/src/lib/motion';
import styles from './styles.module.css';

const searchEntries: SearchEntry[] = generatedSearchIndex;
const resultLimit = 20;

function Highlight({text, query}: {text: string; query: string}): ReactNode {
  const terms = searchTerms(query).sort((a, b) => b.length - a.length);
  if (!terms.length) return text;
  const escaped = terms.map((term) =>
    term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  );
  const parts = text.split(new RegExp(`(${escaped.join('|')})`, 'gi'));
  return parts.map((part, index) =>
    terms.includes(part.toLowerCase()) ? <mark key={index}>{part}</mark> : part,
  );
}

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
  const [product, setProduct] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const dialogId = useId();
  const {pathname} = useLocation();
  const currentProduct =
    registry.products.find((entry) =>
      pathname.includes(`/docs/products/${entry.id}/`),
    )?.id ?? '';

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setProduct('');
    onClick?.();
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, [onClick]);

  useEffect(() => {
    if (variant !== 'navbar' || mobile) return undefined;
    const shortcut = (event: KeyboardEvent) => {
      if (searchKeyAction(event) === 'toggle') {
        event.preventDefault();
        if (!document.querySelector('[aria-label="搜索 MaxCompute 文档"]'))
          setOpen(true);
      }
    };
    document.addEventListener('keydown', shortcut);
    return () => document.removeEventListener('keydown', shortcut);
  }, [variant, mobile]);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();
    const focusable = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'input, select, button, a[href]',
        ) ?? [],
      ).filter((element) => !element.hasAttribute('disabled'));
    const keepFocus = (event: FocusEvent) => {
      if (!dialogRef.current?.contains(event.target as Node))
        inputRef.current?.focus();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      const action = searchKeyAction(event);
      if (action === 'none') return;
      if (action === 'close' || action === 'toggle') {
        event.preventDefault();
        close();
      }
      if (action === 'tab') {
        const elements = focusable();
        const first = elements[0];
        const last = elements.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
      if (action === 'next' || action === 'previous') {
        if (document.activeElement?.tagName === 'SELECT') return;
        const links = Array.from(
          dialogRef.current?.querySelectorAll<HTMLAnchorElement>(
            '[data-search-result]',
          ) ?? [],
        );
        if (!links.length) return;
        event.preventDefault();
        const index = links.findIndex(
          (link) => link === document.activeElement,
        );
        const next =
          index < 0
            ? action === 'next'
              ? 0
              : links.length - 1
            : (index + (action === 'next' ? 1 : -1) + links.length) %
              links.length;
        links[next].focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', keepFocus);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('focusin', keepFocus);
    };
  }, [close, open]);

  useIsomorphicLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog || prefersReducedMotion()) return undefined;
    const {gsap} = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.from(dialog, {y: -14, opacity: 0, duration: 0.3, ease: EASE_OUT});
    }, dialog);
    return () => ctx.revert();
  }, [open]);

  const results = useMemo(
    () => searchDocs(searchEntries, query, {product, currentProduct}),
    [query, product, currentProduct],
  );

  return (
    <>
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? dialogId : undefined}
        className={`${styles.trigger} ${styles[variant]} ${mobile ? styles.mobile : ''}`}
        onClick={() => setOpen(true)}
        ref={triggerRef}
        type="button"
      >
        <MagnifyingGlass aria-hidden="true" size={18} weight="bold" />
        <span>{variant === 'hero' ? '搜索任务、产品或错误' : '搜索文档'}</span>
      </button>
      {open ? (
        <div className={styles.overlay} onMouseDown={close}>
          <section
            aria-label="搜索 MaxCompute 文档"
            aria-modal="true"
            className={styles.dialog}
            id={dialogId}
            onMouseDown={(event) => event.stopPropagation()}
            ref={dialogRef}
            role="dialog"
          >
            <div className={styles.searchBox}>
              <MagnifyingGlass aria-hidden="true" size={22} />
              <input
                aria-label="搜索关键词"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="例如：JDBC 连接、创建项目、dbt 升级"
                ref={inputRef}
                type="search"
                value={query}
              />
              <button aria-label="关闭搜索" onClick={close} type="button">
                <X aria-hidden="true" size={18} />
              </button>
            </div>
            <div className={styles.filters}>
              <label>
                搜索范围{' '}
                <select
                  aria-label="搜索范围"
                  value={product}
                  onChange={(event) => setProduct(event.target.value)}
                >
                  <option value="">全部文档</option>
                  <option value="platform">入门与公共文档</option>
                  {registry.products.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.shortName}
                    </option>
                  ))}
                </select>
              </label>
              <span role="status">
                找到 {results.length} 项
                {results.length > resultLimit
                  ? `，显示前 ${resultLimit} 项`
                  : ''}
              </span>
            </div>
            <div className={styles.results}>
              {results.length ? (
                results.slice(0, resultLimit).map((entry) => (
                  <Link
                    data-search-result="true"
                    key={entry.href}
                    onClick={close}
                    to={entry.href}
                  >
                    <span className={styles.resultGroup}>{entry.group}</span>
                    <span className={styles.resultCopy}>
                      <strong>
                        <Highlight text={entry.title} query={query} />
                      </strong>
                      <small>
                        <Highlight text={entry.snippet} query={query} />
                      </small>
                      {entry.status === 'draft' ? (
                        <span className={styles.resultStatus}>文档草稿</span>
                      ) : null}
                    </span>
                    <ArrowRight aria-hidden="true" size={17} />
                  </Link>
                ))
              ) : (
                <div className={styles.empty}>
                  <strong>没有找到匹配页面</strong>
                  <span>试试减少关键词或切换为“全部文档”。</span>
                  <Link
                    onClick={close}
                    to="/docs/getting-started/client-selection/"
                  >
                    按任务选择工具
                  </Link>
                  <Link onClick={close} to="/docs/faq/">
                    查看连接与权限常见问题
                  </Link>
                </div>
              )}
            </div>
            <footer className={styles.footer}>
              <span>↑ ↓ 选择结果 · Enter 打开 · Esc 关闭 · ⌘/Ctrl K 搜索</span>
              <Link onClick={close} to="/docs/getting-started/">
                第一次使用
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
  return props.mobile ? (
    <li className="menu__list-item">
      <DocSearchTrigger {...props} variant="navbar" />
    </li>
  ) : (
    <DocSearchTrigger {...props} variant="navbar" />
  );
}
