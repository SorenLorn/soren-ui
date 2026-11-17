# Soren UI

> A personal React component library site: browse live previews, read the source, copy the code.

[中文说明](./README.zh-CN.md) · [Repository](https://github.com/SorenLorn/soren-ui) · [Contributing](./CONTRIBUTING.md)

Soren UI is a small, self-built component library shipped together with the documentation site it lives in.
Every component is authored in this repo — no third-party UI kit — and the site is driven entirely by the
folder structure of `src/library`, so a new component shows up in the sidebar, the routes, the API table,
the source viewer and the copy buttons without touching any manifest.

---

## Features

| | |
| --- | --- |
| **Zero-config registry** | `import.meta.glob` scans `src/library/**` at build time. Add files, get a page. |
| **Live examples** | Every example under `examples/` is a real, runnable ES module rendered in an isolated stage. |
| **Source viewer** | File tabs per component (examples → component → styles) with syntax highlighting and usage-snippet focus. |
| **Copy to clipboard** | "Copy usage" copies `imports + JSX` for stateless examples and the whole file when local state is involved. |
| **API tables** | `meta.js` supplies name, description, status, `props` and `related`, rendered as a typed prop table. |
| **Instant search** | Filter components by name, category or description with `Ctrl / ⌘ + K`. |
| **Dark first** | Dark theme by default, light theme available; toggle with the navbar button or press `D` / `T`. |
| **Responsive shell** | Fixed navbar, collapsible sidebar, mobile category drawer, table-of-contents anchors. |

## Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | React 19 |
| Build | Vite 5 (`@vitejs/plugin-react`) |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) + hand-written CSS design tokens |
| Routing | React Router DOM 6 (SPA) |
| Theming | `next-themes` via a thin `ColorModeProvider` wrapper |
| Icons | `lucide-react` |
| Typeface | Geist Sans / Geist Mono (self-hosted via the `geist` package) |

## Quick Start

Requirements: Node.js 18+ and npm.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production bundle in dist/
npm run preview   # serve the production build locally
```

## Project Structure

```text
src/
  library/                      # the component library itself — the single source of truth
    categories.js               # category display name / description / order
    registry.js                 # automatic registration (import.meta.glob)
    popularity.js               # homepage showcase order (weight = "usage", descending)
    popular.js                  # lazy loader used by the homepage showcase
    usage.js                    # extracts the usage snippet + builds copy text
    buttons/button/             # <category>/<component>/
      Button.jsx                # component source (primary tab in the code viewer)
      Button.css                # optional styles (extra tab in the code viewer)
      examples/basic.jsx        # one file = one example = one copyable snippet
      preview.jsx               # homepage thumbnail (renders the component only)
      meta.js                   # name / description / status / API (props) / related
  site/                         # site shell: navbar, sidebar, search, docs pages
    config.js                   # brand name, GitHub URL, route paths
    pages/                      # Home / Category / Component / Docs / Tools / 404
    doc/                        # DemoSection, SourcePanel, ApiTable, DocToc
  theme/color-mode.jsx          # ThemeProvider wrapper (dark by default)
  css/                          # design tokens (variables.css) + site styles (soren.css)
  assets/                       # fonts, icons
```

## Anatomy of a Component

A component folder may contain any of the following. Only the first item is required.

| File | Required | Purpose |
| --- | --- | --- |
| `<Name>.jsx` / `<Name>.tsx` | yes | Component source, shown first in the code viewer. |
| `<Name>.css` | no | Stylesheet, shown as an extra tab next to the source. |
| `examples/*.jsx` | no | Runnable example. The file name becomes the example title. Default export required. |
| `preview.jsx` | no | Thumbnail for the homepage showcase; must render the component on its own. |
| `meta.js` | no | Display name, description, status, `since`, `props`, `related` — falls back to the folder name. |
| `demo.jsx` / `demo.tsx` | no | Optional demo module used when no `examples/` are present. |

Folders or files whose names start with `_` or `.` are ignored, which makes them a good home for internal
sub-components and helpers.

### `meta.js` shape

```js
export default {
  name: 'Button',
  description: 'Four visual variants, three sizes, icons, loading and disabled states.',
  icon: 'MousePointerClick', // lucide icon name
  status: 'stable',          // 'stable' | 'beta' | 'deprecated'
  since: '2026-11',
  related: ['inputs/text-input'],
  props: [
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'ghost' | 'outline'",
      default: "'primary'",
      description: 'Visual variant'
    }
  ]
};
```

### Example contract

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

The example must export a default React component and return its JSX inside `return ( … )` —
that range is what the source viewer highlights and what "Copy usage" extracts.

## Adding a Component

1. Create `src/library/<category>/<component>/`, e.g. `src/library/buttons/button/`.
2. Drop the component file (and optional stylesheet) in — file tabs are generated from file names.
3. Add runnable examples under `examples/`; each file is one example and one snippet.
4. Add `meta.js` to control the display name, description, API table and related components.
5. (Optional) Add `preview.jsx` and an entry in `src/library/popularity.js` to feature it on the homepage.

Nothing else to register: the sidebar, routes, demo area, API table, code viewer and copy buttons all
pick the component up automatically.

## Adding a Category

1. Create a folder with the desired slug under `src/library/`, e.g. `src/library/toggles/`.
2. Components inside it are discovered automatically; the category name is derived from the folder name.
3. To set a proper display name, description and ordering, append an entry to `CATEGORY_META` in
   `src/library/categories.js`:

```js
export const CATEGORY_META = [
  { slug: 'buttons', name: 'Buttons', description: 'Actions and triggers.' }
];
```

Categories that are not listed there still appear, sorted after the registered ones.

## Routing

| Path | Page |
| --- | --- |
| `/` | Landing page: hero, category overview, popular component gallery |
| `/c` | Redirects to the first category |
| `/c/:category` | Category index with every component in that category |
| `/c/:category/:component` | Component page: examples, API, source, related |
| `/docs` | In-app documentation (folder conventions) |
| `/tools` | Placeholder for personal utilities |
| `*` | 404 |

Deep links: `#code=<file>` opens the code viewer on a specific file, `?example=<slug>` selects an example.

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl` / `⌘` + `K` | Open or close component search |
| `D` / `T` | Toggle dark / light theme |
| `↑` `↓` `Enter` `Esc` | Navigate and dismiss the search dialog |

## Theming

Themes are applied through the `data-theme` attribute on `<html>` (`dark` or `light`) and persisted in
`localStorage` under `soren-ui-theme`. Design tokens live in `src/css/variables.css` — change
`--bg-body`, `--bg-card`, `--color-primary`, radii or shadows there and the whole site follows.

```css
:root {
  --bg-body: #0f0f0f;
  --bg-card: #1a1a1a;
  --color-primary: #7c5cff;
  --radius-md: 10px;
}
```

A tiny inline script in `index.html` applies the stored theme before first paint to avoid a flash.

## Deployment

`npm run build` emits a static SPA into `dist/`. It can be served by any static host; the repo also ships a
Cloudflare Workers static-assets config (`wrangler.jsonc`) that serves `dist/` with SPA fallback:

```bash
npm run build
npx wrangler deploy
```

Because routing is client-side, configure the host to rewrite unknown paths to `index.html`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server on port 5173 with HMR |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build locally |

## Components at a Glance

| Category | Component | Notes |
| --- | --- | --- |
| Segmented Controls | `Segmented Control` | Sliding-highlight switcher; controlled or uncontrolled, three sizes, full width |
| Buttons | `Button` | Four variants, three sizes, icons, loading and disabled states |
| Buttons | `Icon Button` | Icon-only button with a required accessible label, three variants |
| Cards | `Card` | Content container with media, title, description, footer and optional hover lift |
| Cards | `Metric Card` | Metric value + unit + delta badge, built with TSX and Tailwind |
| Inputs | `Text Input` | Single-line input with label, hint, error state and affix icons |

## Contributing

Bug reports, fixes and component improvements are welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md).
For a new component, follow the structure above and make sure `npm run build` passes.

## License

Released under the MIT + Commons Clause license. See [LICENSE.md](./LICENSE.md) for the full text.
