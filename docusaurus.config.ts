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
  title: 'MaxCompute 文档',
  tagline: 'MaxCompute 产品使用指南与参考',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  // CI 可覆盖自定义域名；默认值必须始终生成正确的 canonical 和 sitemap。
  url:
    process.env.DOCS_SITE_URL ?? 'https://maxcompute-docs.io.alibaba-inc.com',
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
        },
        blog: {
          routeBasePath: 'blog',
          blogTitle: '博客',
          blogDescription: 'MaxCompute Agentic 生态的产品动态、版本发布与最佳实践。',
          showReadingTime: true,
          postsPerPage: 10,
        },
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
        content: 'MaxCompute,文档,CLI,MCP Server,Desktop',
      },
    ],
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'MaxCompute 文档',
      hideOnScroll: false,
      logo: {
        alt: 'MaxCompute 文档',
        src: 'img/maxcompute-mark.svg',
      },
      items: [
        {
          to: '/',
          position: 'left',
          label: '文档首页',
        },
        {
          type: 'custom-product-menu',
          position: 'left',
          label: '产品文档',
        },
        {
          to: '/docs/best-practices/',
          position: 'left',
          label: '最佳实践',
        },
        {
          to: '/docs/updates/',
          position: 'left',
          label: '更新日志',
        },
        {
          to: '/blog/',
          position: 'left',
          label: '博客',
        },
        {
          type: 'custom-doc-search',
          position: 'right',
        },
        {
          href: 'https://cn.aliyun.com/product/maxcompute',
          label: '产品官网 ↗',
          position: 'right',
        },
        {
          href: 'https://maxcompute.console.aliyun.com/',
          label: '控制台 ↗',
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
            {label: '产品总览', to: '/docs/products/'},
            {label: 'MaxCompute CLI', to: '/docs/products/cli/'},
            {
              label: 'MaxCompute MCP Server',
              to: '/docs/products/mcp-server/',
            },
            {
              label: 'MaxCompute Desktop',
              to: '/docs/products/desktop/',
            },
          ],
        },
        {
          title: '资源',
          items: [
            {label: '最佳实践', to: '/docs/best-practices/'},
            {label: '更新日志', to: '/docs/updates/'},
            {label: '博客', to: '/blog/'},
            {label: '常见问题', to: '/docs/faq/'},
          ],
        },
        {
          title: '相关链接',
          items: [
            {
              label: 'MaxCompute 产品官网',
              href: 'https://cn.aliyun.com/product/maxcompute',
            },
            {
              label: 'MaxCompute 控制台',
              href: 'https://maxcompute.console.aliyun.com/',
            },
            {
              label: 'MaxCompute 帮助中心',
              href: 'https://help.aliyun.com/zh/maxcompute/',
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
