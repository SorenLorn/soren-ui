import { Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SITE } from '../config';
import ComponentShowcase from '../ComponentShowcase';
import usePageMeta from '../usePageMeta';
import { categories, componentCount, categoryCount, firstCategory } from '../../library/registry';

export default function HomePage() {
  usePageMeta({
    title: `${SITE.name} — ${SITE.homeTitle}`,
    description: SITE.homeSubtitle
  });

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

      <section className="sh-cats" aria-label="Categories">
        {categories.map(category => (
          <article className="sh-cat" key={category.slug}>
            <div className="sh-cat-head">
              <Link className="sh-cat-name" to={`/c/${category.slug}`}>
                {category.name}
              </Link>
              <span className="sh-cat-count">{category.components.length}</span>
            </div>
            <ul className="sh-cat-list">
              {category.components.slice(0, 4).map(component => (
                <li key={component.slug}>
                  <Link className="sh-cat-link" to={component.path}>
                    {component.name}
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <ComponentShowcase />
    </div>
  );
}
