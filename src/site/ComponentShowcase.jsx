import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, X } from 'lucide-react';
import GalleryCard from './GalleryCard';
import { loadPopularComponents } from '../library/popular';

const SKELETON_COUNT = 3;

export default function ComponentShowcase({ filter = null, onClearFilter }) {
  const [state, setState] = useState({ status: 'loading', items: [], error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setState(previous => ({ ...previous, status: 'loading', error: null }));

    loadPopularComponents()
      .then(items => {
        if (active) setState({ status: 'ready', items, error: null });
      })
      .catch(error => {
        if (active) setState({ status: 'error', items: [], error });
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  const { status, items, error } = state;

  const visibleItems = useMemo(
    () => (filter ? items.filter(item => item.categorySlug === filter.slug) : items),
    [items, filter]
  );

  return (
    <section className="gallery" aria-labelledby="gallery-title" aria-busy={status === 'loading'}>
      <div className="gallery-head">
        <h2 className="gallery-title" id="gallery-title">
          组件预览
        </h2>

        <div className="gallery-tools">
          <span className="gallery-count" aria-live="polite">
            {status === 'ready' ? `${visibleItems.length} components` : 'Loading…'}
          </span>
          {filter && (
            <button type="button" className="gallery-filter" onClick={onClearFilter} title="清除分类筛选">
              {filter.name}
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {status === 'loading' && (
        <div className="gallery-grid" role="status" aria-live="polite">
          <span className="sr-only">组件加载中…</span>
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <div className="gallery-card is-skeleton" key={index} aria-hidden="true">
              <div className="gallery-frame is-loading">
                <span className="sh-skel sh-skel--thumb" />
              </div>
              <div className="gallery-meta">
                <span className="sh-skel sh-skel--line" style={{ width: '36%' }} />
                <span className="sh-skel sh-skel--line" style={{ width: '18%' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {status === 'error' && (
        <div className="sh-empty" role="alert">
          <span title={error?.message || undefined}>组件加载失败，请重试。</span>
          <button type="button" className="sh-empty-action" onClick={() => setAttempt(count => count + 1)}>
            <RefreshCw size={12} />
            重试
          </button>
        </div>
      )}

      {status === 'ready' && visibleItems.length === 0 && (
        <div className="sh-empty">
          <span>{filter ? `「${filter.name}」暂无可预览的组件。` : '还没有可展示的组件。'}</span>
          {filter && (
            <Link className="sh-empty-action" to={`/c/${filter.slug}`}>
              前往分类页
            </Link>
          )}
        </div>
      )}

      {status === 'ready' && visibleItems.length > 0 && (
        <div className="gallery-grid">
          {visibleItems.map(item => (
            <GalleryCard key={`${item.categorySlug}/${item.slug}`} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
