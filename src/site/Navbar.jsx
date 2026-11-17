import { Github, Moon, Search, Sun } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { SITE } from './config';
import { useColorMode } from '../theme/color-mode';

const NAV_LINKS = [
  { label: 'Docs', to: SITE.docsPath },
  { label: 'Tools', to: SITE.toolsPath }
];

export default function Navbar({ onOpenSearch }) {
  const { resolvedTheme, toggleColorMode } = useColorMode();
  const isDark = resolvedTheme !== 'light';

  return (
    <header className="sn-nav">
      <div className="sn-nav-inner">
        <Link to="/" className="sn-brand" aria-label={`${SITE.name} home`}>
          <span className="sn-brand-mark" aria-hidden="true">
            {SITE.mark}
          </span>
          <span className="sn-brand-name">{SITE.name}</span>
        </Link>

        <span className="sn-nav-divider" aria-hidden="true" />

        <nav className="sn-nav-links" aria-label="Main">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sn-nav-link${isActive ? ' is-active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <span className="sn-nav-spacer" />

        <div className="sn-nav-actions">
          <button
            type="button"
            className="sn-icon-btn"
            onClick={onOpenSearch}
            aria-label="搜索组件"
            title="搜索组件（Ctrl / ⌘ + K）"
          >
            <Search size={16} />
          </button>
          <button
            type="button"
            className="sn-icon-btn"
            onClick={toggleColorMode}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <a
            className="sn-icon-btn"
            href={SITE.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            title="GitHub"
          >
            <Github size={16} />
          </a>
        </div>
      </div>
    </header>
  );
}
