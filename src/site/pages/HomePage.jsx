import { useState } from 'react';
import { Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SITE } from '../config';
import ComponentShowcase from '../ComponentShowcase';
import usePageMeta from '../usePageMeta';
import { categories, componentCount, categoryCount, firstCategory } from '../../library/registry';

export default function HomePage() {
  const [filter, setFilter] = useState(null);

  usePageMeta({
    title: `${SITE.name} — ${SITE.homeTitle}`,
    description: SITE.homeSubtitle
  });

  const toggleFilter = category => {
    setFilter(current => (current?.slug === category.slug ? null : { slug: category.slug, name: category.name }));
  };

  return (
    <div className="sh">
      <section className="sh-hero">
        <h1 className="sh-title">{SITE.homeTitle}</h1>
        <p className="sh-sub">{SITE.homeSubtitle}</p>

        <div className="sh-actions">
          <Link className="sh-btn sh-btn--primary" to={`/c/${firstCategory?.slug ?? ''}`}>
            Browse components
          </Link>
          <a className="sh-btn sh-btn--ghost" href={SITE.github} target="_blank" rel="noreferrer">
            <Github size={15} />
            Star on GitHub
          </a>
        </div>

        <p className="sh-stats">
          {categoryCount} categories · {componentCount} components
        </p>
      </section>

      <div className="sh-body">
        <aside className="sh-rail" aria-label="Component categories">
          <div className="sh-rail-head">
            <span className="sh-rail-label">Categories</span>
            <span className="sh-rail-total">{categoryCount}</span>
          </div>

          <div className="sh-rail-scroll">
            <button
              type="button"
              className={`sh-rail-item${filter === null ? ' is-active' : ''}`}
              onClick={() => setFilter(null)}
              aria-pressed={filter === null}
            >
              <span className="sh-rail-name">All components</span>
              <span className="sh-rail-num">{componentCount}</span>
            </button>

            {categories.map(category => {
              const isActive = filter?.slug === category.slug;

              return (
                <div className="sh-rail-group" key={category.slug}>
                  <button
                    type="button"
                    className={`sh-rail-item${isActive ? ' is-active' : ''}`}
                    onClick={() => toggleFilter(category)}
                    aria-pressed={isActive}
                  >
                    <span className="sh-rail-name">{category.name}</span>
                    <span className="sh-rail-num">{category.components.length}</span>
                  </button>

                  <ul className="sh-rail-sub">
                    {category.components.map(component => (
                      <li key={component.slug}>
                        <Link className="sh-rail-link" to={component.path}>
                          {component.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <Link className="sh-rail-foot" to={`/c/${firstCategory?.slug ?? ''}`}>
            Open category page
          </Link>
        </aside>

        <ComponentShowcase filter={filter} onClearFilter={() => setFilter(null)} />
      </div>
    </div>
  );
}
