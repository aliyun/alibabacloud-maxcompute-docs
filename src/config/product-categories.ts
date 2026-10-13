import type {ProductIconName} from '@site/src/components/ProductIcon';

export type ProductCategoryId = 'ai' | 'interface' | 'connector';

export type CategoryItem = {
  id: string;
  label: string;
  href: string;
  icon: ProductIconName;
  accent: 'orange' | 'blue' | 'violet' | 'green' | 'cyan' | 'amber' | 'emerald';
  external?: boolean;
  comingSoon?: boolean;
};

export type ProductCategory = {
  id: ProductCategoryId;
  label: string;
  description: string;
  gradient: string;
  items: CategoryItem[];
};

export const productCategories: ProductCategory[] = [
  {
    id: 'ai',
    label: 'AI 入口',
    description: '面向人与 Agent 的自然语言、命令行与协议入口。',
    gradient: 'violet',
    items: [],
  },
  {
    id: 'interface',
    label: '编程接口',
    description: '通过 SDK、JDBC 与 ODBC 将 MaxCompute 嵌入应用与工作流。',
    gradient: 'cyan',
    items: [
      {
        id: 'sdk',
        label: 'SDK',
        href: '#',
        icon: 'code',
        accent: 'cyan',
        comingSoon: true,
      },
      {
        id: 'jdbc',
        label: 'JDBC',
        href: '#',
        icon: 'database',
        accent: 'cyan',
        comingSoon: true,
      },
      {
        id: 'odbc',
        label: 'ODBC',
        href: '#',
        icon: 'database',
        accent: 'cyan',
        comingSoon: true,
      },
    ],
  },
  {
    id: 'connector',
    label: '数据连接器',
    description: '连接 Flink、Spark、dbt 等生态，构建统一数据流水线。',
    gradient: 'amber',
    items: [
      {
        id: 'spark',
        label: 'Spark',
        href: '#',
        icon: 'lightning',
        accent: 'amber',
        comingSoon: true,
      },
      {
        id: 'dbt',
        label: 'dbt',
        href: '#',
        icon: 'plug',
        accent: 'amber',
        comingSoon: true,
      },
    ],
  },
];
