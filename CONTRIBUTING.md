# Contributing to Soren UI

Thanks for taking the time to improve Soren UI. This guide covers the conventions used in this repository
so that changes land quickly and stay consistent.

## Before You Start

- Search the issue tracker for an existing report or discussion before opening a new issue.
- For anything larger than a fix (new component, new category, layout change), open an issue first and
  describe the intent, so the design direction can be agreed on before code is written.
- Keep pull requests focused: one feature or one fix per PR.

## Branch Naming

```text
feat/<short-description>     # new component or feature
fix/<short-description>      # bug fix
docs/<short-description>     # documentation only
refactor/<short-description> # internal restructuring, no behavior change
```

Example: `feat/segmented-control-disabled`.

## Adding a Component

1. Create `src/library/<category>/<component>/`.
2. Add the component source (`<Name>.jsx` or `<Name>.tsx`) and, if needed, a matching stylesheet.
3. Add at least one runnable example under `examples/` — one file per example, default export, JSX returned
   from `return ( … )`.
4. Add `meta.js` with `name`, `description`, `status`, `since`, `props` and `related`. Every prop exposed by
   the component must be documented.
5. Optional: add `preview.jsx` and a `popularity.js` entry to feature the component on the homepage.
6. Document new components in both `README.md` and `README.zh-CN.md` component tables if the public surface
   changes.

No registry, route or manifest edits are required — `src/library/registry.js` discovers everything.

## Style and Conventions

- Components are self-contained: no shared UI library, no global state.
- Prefer plain CSS files co-located with the component; Tailwind utilities are acceptable where a component
  is explicitly declared as a Tailwind implementation in its `meta.js` description.
- Use the design tokens from `src/css/variables.css` (`--bg-card`, `--color-primary`, `--radius-md`, …)
  instead of hard-coded colors so both themes keep working.
- Accessibility is required: interactive elements need an accessible name, `aria-*` state must reflect props,
  and keyboard interaction must work without a mouse.
- Follow the existing naming: `sbtn`, `sinput`, `scard`-style class prefixes keep component CSS scoped.

## Pull Request Checklist

- [ ] `npm run build` completes without errors.
- [ ] The change was verified in both dark and light themes.
- [ ] Layout was checked on desktop and mobile widths.
- [ ] Featured examples still run, and the copy buttons produce code that compiles.
- [ ] `meta.js` prop tables match the actual component props.
- [ ] No console errors or warnings introduced.
- [ ] Documentation is updated when behavior or the public API changes.

Include a short description, the motivation, and screenshots or a screen recording for visual changes.

## Documentation

- `README.md` is the English entry point; `README.zh-CN.md` mirrors it in Chinese. Keep both in sync.
- The in-app docs page (`src/site/pages/DocsPage.jsx`) explains folder conventions and must stay accurate.
- Site-level strings such as the brand name and GitHub URL live in `src/site/config.js`.

## Reporting Bugs

Please include:

- What you expected and what actually happened.
- Steps to reproduce, ideally with the component path (`/c/<category>/<component>`).
- Browser and OS versions, plus light or dark theme.
- A screenshot or recording when the issue is visual.

## License

By contributing you agree that your contributions are licensed under the same MIT + Commons Clause terms
described in [LICENSE.md](./LICENSE.md).
