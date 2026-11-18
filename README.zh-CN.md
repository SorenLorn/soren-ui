# Soren UI

> 个人专属 React 组件库站点：组件预览 + 源码查看 + 一键复制。

[English](./README.md) · [仓库](https://github.com/SorenLorn/soren-ui) · [贡献指南](./CONTRIBUTING.md)

Soren UI 是一套自建组件库，并附带承载它的文档站点。所有组件都由本仓库手写实现，站点完全由
`src/library` 的目录结构驱动——新增组件后，侧栏、路由、示例区、API 表格、源码区与复制按钮都会
自动生效，无需改动任何清单文件。

## 功能

| | |
| --- | --- |
| **零配置注册** | 构建期用 `import.meta.glob` 扫描 `src/library/**`，放文件即出页面。 |
| **可运行示例** | `examples/` 下每个文件都是一个真实可运行的 ES 模块，在独立舞台中渲染。 |
| **源码查看** | 每个组件按文件生成 Tab（示例 → 组件 → 样式），带语法高亮与用法片段定位。 |
| **一键复制** | 「复制用法」在示例无本地状态时复制 `import + JSX`，有 hook 时复制整份文件以保证可运行。 |
| **API 表格** | `meta.js` 提供名称、描述、状态、`props` 与 `related`，渲染为带类型的属性表。 |
| **即时搜索** | `Ctrl / ⌘ + K` 按名称、分类或描述筛选组件。 |
| **深色优先** | 默认深色主题，可切换浅色；按 `D` / `T` 也可切换。 |
| **响应式外壳** | 固定导航栏、可折叠侧栏、移动端分类抽屉、文档目录锚点。 |

## 技术栈

| 层 | 选型 |
| --- | --- |
| 框架 | React 19 |
| 构建 | Vite 5（`@vitejs/plugin-react`） |
| 样式 | Tailwind CSS v4（`@tailwindcss/vite`）+ 手写 CSS 设计令牌 |
| 路由 | React Router DOM 6（SPA） |
| 主题 | `next-themes` + 轻量 `ColorModeProvider` 包装 |
| 图标 | `lucide-react` |
| 字体 | Geist Sans / Geist Mono（通过 `geist` 包自托管） |

## 本地开发

环境要求：Node.js 18+ 与 npm。

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # 生产构建，产物在 dist/
npm run preview   # 本地预览生产构建
```

## 目录结构

```text
src/
  library/                      # 组件库本体，唯一内容源
    categories.js               # 分类显示名 / 描述 / 排序
    registry.js                 # 自动注册（import.meta.glob）
    popularity.js               # 首页展示顺序权重（usage，倒序）
    popular.js                  # 首页展示区使用的懒加载器
    usage.js                    # 提炼用法片段并生成复制文本
    buttons/button/             # <分类>/<组件>/
      Button.jsx                # 组件源码（源码区主文件）
      Button.css                # 可选，样式文件（源码区可切换）
      examples/basic.jsx        # 一个文件 = 一个示例 = 一段可复制的源码
      preview.jsx               # 首页缩略展示（只渲染组件本体）
      meta.js                   # 名称 / 描述 / 状态 / API（props）/ 相关组件
  site/                         # 站点外壳：导航、侧栏、搜索、文档页
    config.js                   # 品牌名、GitHub 地址、路由路径
    pages/                      # 首页 / 分类 / 组件 / 文档 / 工具 / 404
    doc/                        # DemoSection、SourcePanel、ApiTable、DocToc
  theme/color-mode.jsx          # 主题 Provider（默认深色）
  css/                          # 设计令牌（variables.css）+ 站点样式（soren.css）
  assets/                       # 字体、图标
```

## 组件目录说明

以下文件除第一项外均为可选。

| 文件 | 必需 | 作用 |
| --- | --- | --- |
| `<Name>.jsx` / `<Name>.tsx` | 是 | 组件源码，源码区第一个 Tab。 |
| `<Name>.css` | 否 | 样式文件，在源码区作为额外 Tab 出现。 |
| `<Name>.ts` | 否 | 组件依赖的纯 TypeScript 模块（如图片管线），在源码区作为独立 Tab 出现。 |
| `examples/*.jsx` | 否 | 可运行示例，文件名即示例标题，需要默认导出。 |
| `preview.jsx` | 否 | 首页展示区缩略图，只渲染组件本身。 |
| `meta.js` | 否 | 显示名称、描述、状态、`since`、`props`、`related`，缺省则用文件夹名推导。 |
| `demo.jsx` / `demo.tsx` | 否 | 无 `examples/` 时可选的演示模块。 |

以 `_` 或 `.` 开头的目录与文件不会被注册，适合放内部子组件和辅助函数。

### `meta.js` 结构

```js
export default {
  name: 'Button',
  description: '四种视觉变体、三种尺寸，支持图标、加载中与禁用状态。',
  icon: 'MousePointerClick', // lucide 图标名
  status: 'stable',          // 'stable' | 'beta' | 'deprecated'
  since: '2026-11',
  related: ['inputs/text-input'],
  // 可选：在组件页渲染为「交互说明」区块
  notes: [{ title: '功能名', text: '呈现形式、触发条件与联动关系。' }],
  props: [
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'ghost' | 'outline'",
      default: "'primary'",
      description: '视觉变体'
    }
  ]
};
```

### 示例约定

```jsx
import Button from '../Button';

export default function ButtonBasic() {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
    </div>
  );
}
```

示例必须默认导出 React 组件，并把 JSX 放在 `return ( … )` 之间——这段区间就是源码区高亮的范围，
也是「复制用法」提取的内容。

## 新增组件

1. 新建目录 `src/library/<分类>/<组件>/`，例如 `src/library/buttons/button/`。
2. 放入组件源码（可选样式文件），源码区 Tab 会按文件名自动生成。
3. 在 `examples/` 下为每个文件放一个可运行示例，一个文件即一个示例与一段源码。
4. 用 `meta.js` 覆盖显示名称、描述、API 表格与相关组件。
5. （可选）加 `preview.jsx` 并在 `src/library/popularity.js` 补一条权重，让组件出现在首页展示区。

其余无需登记：侧栏、路由、示例区、API 表格、源码区与复制按钮都会自动生效。

## 新增分类

1. 在 `src/library/` 下建一个同名文件夹，例如 `src/library/toggles/`。
2. 其中的组件会被自动发现，分类名由文件夹名推导。
3. 要指定显示名、描述与排序，在 `src/library/categories.js` 的 `CATEGORY_META` 里加一条：

```js
export const CATEGORY_META = [
  { slug: 'buttons', name: 'Buttons', description: 'Actions and triggers.' }
];
```

未登记的分类同样会出现，排在已登记分类之后。

## 路由

| 路径 | 页面 |
| --- | --- |
| `/` | 首页：Hero、分类概览、热门组件展示区 |
| `/c` | 重定向到第一个分类 |
| `/c/:category` | 分类索引页 |
| `/c/:category/:component` | 组件详情页：示例、API、源码、相关组件 |
| `/docs` | 站内文档（目录约定） |
| `/tools` | 工具区（预留） |
| `*` | 404 |

深链：`#code=<file>` 打开源码区并定位文件，`?example=<slug>` 选中某个示例。

## 快捷键

| 快捷键 | 行为 |
| --- | --- |
| `Ctrl` / `⌘` + `K` | 打开 / 关闭组件搜索 |
| `D` / `T` | 切换深色 / 浅色主题 |
| `↑` `↓` `Enter` `Esc` | 搜索面板中选择与关闭 |

## 主题

主题通过 `<html>` 上的 `data-theme` 属性（`dark` / `light`）生效，并持久化在 `localStorage` 的
`soren-ui-theme` 键下。设计令牌集中在 `src/css/variables.css`，修改 `--bg-body`、`--bg-card`、
`--color-primary`、圆角或阴影即可整体换肤。

```css
:root {
  --bg-body: #0f0f0f;
  --bg-card: #1a1a1a;
  --color-primary: #7c5cff;
  --radius-md: 10px;
}
```

`index.html` 里有一段内联脚本，在首屏渲染前应用已保存的主题，避免闪白。

## 部署

`npm run build` 产出静态 SPA 到 `dist/`，可交由任意静态托管。仓库内附带 Cloudflare Workers
静态资源配置（`wrangler.jsonc`），以 SPA 回退方式提供 `dist/`：

```bash
npm run build
npx wrangler deploy
```

由于路由在客户端，托管方需要把未知路径重写到 `index.html`。

## 命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Vite 开发服务器（端口 5173，带 HMR） |
| `npm run build` | 生产构建到 `dist/` |
| `npm run preview` | 本地预览生产构建 |

## 组件一览

| 分类 | 组件 | 说明 |
| --- | --- | --- |
| Segmented Controls | `Segmented Control` | 带滑动高亮块的分段切换控件，支持受控 / 非受控、三种尺寸与占满宽度 |
| Segmented Controls | `Category` | iOS 风格毛玻璃分段控件，等分滑块、方向键切换、深浅色自适应 |
| Buttons | `Button` | 四种变体、三种尺寸，支持图标、加载中与禁用状态 |
| Buttons | `Icon Button` | 纯图标按钮，强制 label 保证无障碍名称，支持三种变体 |
| Cards | `Card` | 内容卡片容器，支持媒体区、标题、描述、页脚与可选 hover 抬升效果 |
| Cards | `Metric Card` | 指标卡片：主数值 + 单位 + 环比涨跌徽标，TSX + Tailwind 实现 |
| Cards | `Holo Card` | WebGL 全息镭射卡：12 种闪光花纹、指针倾斜、双面翻转与静态降级，另带换图 / 调光交互台 |
| Inputs | `Text Input` | 带标签、提示与错误状态的单行输入框，支持前后缀图标与三种尺寸 |

## 参与贡献

欢迎提交问题、修复与组件改进，详见 [CONTRIBUTING.md](./CONTRIBUTING.md)。新增组件请遵循上述目录约定，
并确保 `npm run build` 通过。

## 许可证

本项目采用 MIT + Commons Clause 协议，完整条款见 [LICENSE.md](./LICENSE.md)。
