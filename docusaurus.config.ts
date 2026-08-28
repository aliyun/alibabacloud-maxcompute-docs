import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const algoliaConfig =
  process.env.ALGOLIA_APP_ID &&
  process.env.ALGOLIA_SEARCH_API_KEY &&
  process.env.ALGOLIA_INDEX_NAME
    ? {
        appId: process.env.ALGOLIA_APP_ID,
        apiKey: process.env.ALGOLIA_SEARCH_API_KEY,
        indexName: process.env.ALGOLIA_INDEX_NAME,
        contextualSearch: true,
      }
    : undefined;

const showLastUpdate = process.env.DOCS_SHOW_LAST_UPDATE === 'true';

const config: Config = {
  title: 'MaxCompute 文档中心',
  tagline: 'MaxCompute 多组件统一文档平台',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  // 部署时通过 CI 变量覆盖，避免在仓库中写入未经确认的生产域名。
  url: process.env.DOCS_SITE_URL ?? 'http://localhost:3000',
  baseUrl: process.env.DOCS_BASE_URL ?? '/',
  organizationName: 'odps',
  projectName: 'maxcompute-docs',
  // Aone Pages 按目录提供静态文件，使用尾斜线生成 route/index.html。
  trailingSlash: true,
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  onDuplicateRoutes: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
    localeConfigs: {
      'zh-Hans': {
        label: '简体中文',
        htmlLang: 'zh-CN',
      },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts',
          breadcrumbs: true,
          showLastUpdateAuthor: showLastUpdate,
          showLastUpdateTime: showLastUpdate,
          editUrl:
            'https://gitlab.alibaba-inc.com/odps/maxcompute-docs/-/edit/master/',
        },
        blog: false,
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    ...(algoliaConfig ? {algolia: algoliaConfig} : {}),
    metadata: [
      {
        name: 'keywords',
        content: 'MaxCompute,文档,SDK,连接器,开发工具',
      },
    ],
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'MaxCompute 文档中心',
      hideOnScroll: true,
      logo: {
        alt: 'MaxCompute 文档中心',
        src: 'img/maxcompute-mark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'overviewSidebar',
          position: 'left',
          label: '开始使用',
        },
        {
          type: 'docSidebar',
          sidebarId: 'componentsSidebar',
          position: 'left',
          label: '组件文档',
        },
        {
          type: 'docSidebar',
          sidebarId: 'guidesSidebar',
          position: 'left',
          label: '指南与参考',
        },
        {
          type: 'docSidebar',
          sidebarId: 'contributorSidebar',
          position: 'left',
          label: '参与贡献',
        },
        {
          href: 'https://gitlab.alibaba-inc.com/odps/maxcompute-docs',
          label: 'GitLab',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '文档',
          items: [
            {label: '开始使用', to: '/docs/intro/'},
            {label: '组件文档', to: '/docs/components/'},
            {label: '最佳实践', to: '/docs/best-practices/'},
          ],
        },
        {
          title: '平台',
          items: [
            {label: '贡献指南', to: '/docs/contributing/'},
            {label: '平台架构', to: '/docs/platform/architecture/'},
            {label: '版本策略', to: '/docs/platform/versioning/'},
          ],
        },
        {
          title: '仓库',
          items: [
            {
              label: 'GitLab',
              href: 'https://gitlab.alibaba-inc.com/odps/maxcompute-docs',
            },
            {
              label: '提交问题',
              href: 'https://gitlab.alibaba-inc.com/odps/maxcompute-docs/-/issues/new',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} MaxCompute.`,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'java', 'python', 'sql', 'yaml'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
