import { CATEGORY_META } from './categories';
import { buildUsage, extractSnippet } from './usage';

/**
 * 组件自动注册（目录即结构，两层封顶）
 *
 * src/library/<分类>/<组件>/
 *   Foo.jsx            组件源码（Code Tab 主文件）
 *   Foo.css            可选，样式文件一并进入 Code Tab
 *   examples/*.jsx     可运行示例：一个文件 = 一个示例 = 一段可复制的源码
 *   preview.jsx        可选，首页缩略展示（只渲染组件本体）
 *   meta.js            可选，{ name, description, status, since, props, related }
 *
 * 约定：`_` 或 `.` 开头的目录/文件不注册（内部部件放这里）。
 */
const SOURCES = import.meta.glob('./*/*/*.{jsx,tsx,css}', { query: '?raw', import: 'default', eager: true });
const DEMOS = import.meta.glob('./*/*/demo.{jsx,tsx}');
const PREVIEWS = import.meta.glob('./*/*/preview.{jsx,tsx}');
const METAS = import.meta.glob('./*/*/meta.js', { eager: true });
const EXAMPLES = import.meta.glob('./*/*/examples/*.{jsx,tsx}');
const EXAMPLE_SOURCES = import.meta.glob('./*/*/examples/*.{jsx,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true
});

const SKIP_FILES = new Set(['demo.jsx', 'demo.tsx', 'preview.jsx', 'preview.tsx', 'meta.js']);

const toTitleCase = slug =>
  slug
    .split(/[-_]/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const stripExt = file => file.replace(/\.(jsx|tsx)$/, '');

const toLabel = file => toTitleCase(stripExt(file));

const langOf = name => (name.endsWith('.css') ? 'css' : name.endsWith('.tsx') ? 'tsx' : 'jsx');

const extRank = name => (name.endsWith('.css') ? 1 : 0);

/** 同一入口允许 .jsx / .tsx 两种实现 */
const pickModule = (modules, prefix) => {
  const key = Object.keys(modules).find(item => item === `${prefix}.jsx` || item === `${prefix}.tsx`);
  return key ? modules[key] : null;
};

const isIgnored = segment => !segment || segment.startsWith('_') || segment.startsWith('.');

function parseSourcePath(path) {
  const [category, component, file] = path.replace(/^\.\//, '').split('/');
  return { category, component, file };
}

function parseExamplePath(path) {
  const [category, component, , file] = path.replace(/^\.\//, '').split('/');
  return { category, component, file };
}

function buildComponentMap() {
  const components = new Map();

  for (const [path, code] of Object.entries(SOURCES)) {
    const { category, component, file } = parseSourcePath(path);
    if (SKIP_FILES.has(file) || isIgnored(category) || isIgnored(component)) continue;

    const key = `${category}/${component}`;
    if (!components.has(key)) components.set(key, { categorySlug: category, slug: component, files: [] });
    components.get(key).files.push({ name: file, code, lang: langOf(file) });
  }

  for (const entry of components.values()) {
    entry.files.sort((a, b) => extRank(a.name) - extRank(b.name) || a.name.localeCompare(b.name));

    const meta = METAS[`./${entry.categorySlug}/${entry.slug}/meta.js`]?.default ?? {};

    entry.name = meta.name || toTitleCase(entry.slug);
    entry.description = meta.description || '';
    entry.icon = meta.icon || null;
    entry.status = meta.status || 'stable';
    entry.since = meta.since || null;
    entry.props = Array.isArray(meta.props) ? meta.props : [];
    entry.related = Array.isArray(meta.related) ? meta.related : [];
    entry.load = pickModule(DEMOS, `./${entry.categorySlug}/${entry.slug}/demo`);
    entry.preview = pickModule(PREVIEWS, `./${entry.categorySlug}/${entry.slug}/preview`);
    entry.examples = [];
    entry.categoryName = toTitleCase(entry.categorySlug);
    entry.path = `/c/${entry.categorySlug}/${entry.slug}`;
  }

  for (const [path, load] of Object.entries(EXAMPLES)) {
    const { category, component, file } = parseExamplePath(path);
    const entry = components.get(`${category}/${component}`);
    if (!entry) continue;

    const slug = stripExt(file);
    const code = EXAMPLE_SOURCES[path] || '';
    const snippet = extractSnippet(code);

    entry.examples.push({
      slug,
      name: toLabel(file),
      file,
      load,
      code,
      snippet,
      range: snippet ? { start: snippet.startLine, end: snippet.endLine } : null,
      usage: buildUsage(code, snippet)
    });
  }

  for (const entry of components.values()) {
    entry.examples.sort((a, b) => a.slug.localeCompare(b.slug));

    // Code Tab 顺序：示例源码 → 组件源码 → 样式
    entry.codeFiles = [
      ...entry.examples.map(example => ({
        name: example.file,
        code: example.code,
        lang: langOf(example.file),
        example: example.slug,
        range: example.range
      })),
      ...entry.files
    ];
  }

  return components;
}

function buildCategories(componentMap) {
  const byCategory = new Map();

  for (const component of componentMap.values()) {
    if (!byCategory.has(component.categorySlug)) byCategory.set(component.categorySlug, []);
    byCategory.get(component.categorySlug).push(component);
  }

  const known = new Map(CATEGORY_META.map(item => [item.slug, item]));
  const orderedSlugs = [
    ...CATEGORY_META.map(item => item.slug).filter(slug => byCategory.has(slug)),
    ...[...byCategory.keys()].filter(slug => !known.has(slug)).sort()
  ];

  const categories = orderedSlugs.map(slug => {
    const meta = known.get(slug) || {};
    const categoryName = meta.name || toTitleCase(slug);
    const components = byCategory.get(slug).sort((a, b) => a.name.localeCompare(b.name));

    // 复用同一份对象引用，prev/next 与详情页拿到的字段保持一致
    components.forEach(component => {
      component.categoryName = categoryName;
    });

    return {
      slug,
      name: categoryName,
      description: meta.description || '',
      components
    };
  });

  for (const category of categories) {
    category.components.forEach((component, index, list) => {
      component.prev = index > 0 ? list[index - 1] : null;
      component.next = index < list.length - 1 ? list[index + 1] : null;
    });
  }

  return categories;
}

const componentMap = buildComponentMap();

export const categories = buildCategories(componentMap);

export const componentCount = componentMap.size;

export const categoryCount = categories.length;

export const firstCategory = categories[0];

export function findCategory(slug) {
  return categories.find(category => category.slug === slug);
}

export function findComponent(categorySlug, componentSlug) {
  return componentMap.get(`${categorySlug}/${componentSlug}`);
}

export function findComponentBySlug(componentSlug) {
  return [...componentMap.values()].find(component => component.slug === componentSlug);
}
