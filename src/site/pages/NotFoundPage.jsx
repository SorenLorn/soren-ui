import { Link } from 'react-router-dom';
import usePageMeta from '../usePageMeta';
import { firstCategory } from '../../library/registry';

export default function NotFoundPage() {
  usePageMeta({ title: '404 · Soren UI', description: '页面不存在' });

  return (
    <div className="sh" style={{ paddingTop: 120 }}>
      <section className="sh-hero">
        <h1 className="sh-title">404</h1>
        <p className="sh-sub">这个页面不存在，可能组件被改名或删掉了。</p>
        <div className="sh-actions">
          <Link className="sh-btn sh-btn--primary" to="/">
            Back home
          </Link>
          {firstCategory && (
            <Link className="sh-btn sh-btn--ghost" to={`/c/${firstCategory.slug}`}>
              Browse components
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
