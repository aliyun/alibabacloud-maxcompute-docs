import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import registry from '@site/config/components.json';

import styles from './styles.module.css';

const statusLabels = {
  draft: '内容建设中',
  published: '已发布',
  deprecated: '已弃用',
} as const;

type ComponentStatus = keyof typeof statusLabels;

type ComponentEntry = {
  id: string;
  name: string;
  description: string;
  href: string;
  category: string;
  status: ComponentStatus;
};

export default function ComponentGrid(): ReactNode {
  const components = registry.components as ComponentEntry[];

  return (
    <div className={styles.grid}>
      {components.map((component, index) => (
        <Link className={styles.card} key={component.id} to={component.href}>
          <div className={styles.cardTop}>
            <span className={styles.index} aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className={`${styles.status} ${styles[component.status]}`}>
              {statusLabels[component.status]}
            </span>
          </div>
          <Heading as="h3">{component.name}</Heading>
          <p>{component.description}</p>
          <span className={styles.open}>进入文档 →</span>
        </Link>
      ))}
    </div>
  );
}
