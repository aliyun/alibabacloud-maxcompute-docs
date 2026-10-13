import type {ReactNode} from 'react';
import DocItem from '@theme-original/DocItem';
import {useReveal} from '@site/src/lib/motion';

import styles from './styles.module.css';

export default function DocItemWrapper(
  props: Record<string, unknown>,
): ReactNode {
  const ref = useReveal<HTMLDivElement>(':scope > *', {
    y: 18,
    stagger: 0.05,
    duration: 0.5,
    start: 'top 90%',
  });

  return (
    <div className={styles.root} ref={ref}>
      <DocItem {...props} />
    </div>
  );
}
