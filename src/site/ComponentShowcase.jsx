import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import GalleryCard from './GalleryCard';
import { loadPopularComponents } from '../library/popular';

const SKELETON_COUNT = 3;

export default function ComponentShowcase() {
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

  return (
    <section className="gallery" aria-labelledby="gallery-title" aria-busy={status === 'loading'}>
      <h2 className="gallery-title" id="gallery-title">
        组件预览
      </h2>

      {status === 'loading' && (
        <div className="gallery-grid" role="status" aria-live="polite">
          <span className="sr-only">组件加载中…</span>
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <div className="gallery-card" key={index} aria-hidden="true">
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

      {status === 'ready' && items.length === 0 && <div className="sh-empty">还没有可展示的组件。</div>}

      {status === 'ready' && items.length > 0 && (
        <div className="gallery-grid">
          {items.map(item => (
            <GalleryCard key={`${item.categorySlug}/${item.slug}`} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
