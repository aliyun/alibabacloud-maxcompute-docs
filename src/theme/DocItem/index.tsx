import type {ReactNode} from 'react';
import type {Props} from '@theme/DocItem';
import Link from '@docusaurus/Link';
import DocItem from '@theme-original/DocItem';
import {useReveal} from '@site/src/lib/motion';

import styles from './styles.module.css';

export default function DocItemWrapper(props: Props): ReactNode {
  const frontMatter = props.content.frontMatter;
  const status = 'status' in frontMatter ? frontMatter.status : undefined;
  const ref = useReveal<HTMLDivElement>(':scope > *', {
    y: 18,
    stagger: 0.05,
    duration: 0.5,
    start: 'top 90%',
  });

  return (
    <div className={styles.root} ref={ref}>
      {status === 'draft' ? (
        <aside className={styles.status} aria-label="文档状态">
          <strong>文档草稿</strong>
          <span>内容仍在完善；产品成熟度与支持范围请核对</span>
          <Link to="/docs/updates/">版本说明</Link>。
        </aside>
      ) : status === 'deprecated' ? (
        <aside className={styles.status} aria-label="文档状态">
          此文档已弃用，请先核对目标产品的版本说明。
        </aside>
      ) : null}
      <DocItem {...props} />
    </div>
  );
}
