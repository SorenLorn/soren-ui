import { Suspense, lazy, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

/**
 * 展示卡：预览舞台 + 信息行，整卡即链接。
 * 三态反馈：加载中显示骨架屏 → 内容淡入；hover 上浮并显示「View」提示；active 回弹。
 */
export default function GalleryCard({ item }) {
  const Preview = useMemo(() => {
    const loader = item.preview || item.load;
    return loader ? lazy(loader) : null;
  }, [item]);

  return (
    <Link className="gallery-card" to={item.path} aria-label={`${item.name} — ${item.categoryName}`}>
      <div className="gallery-frame" inert aria-hidden="true">
        <Suspense fallback={<span className="sh-skel sh-skel--thumb" />}>
          {Preview && (
            <div className="gallery-stage">
              <Preview />
            </div>
          )}
        </Suspense>

        <span className="gallery-hint">
          View
          <ArrowUpRight size={11} />
        </span>
      </div>

      <div className="gallery-meta">
        <span className="gallery-name">{item.name}</span>
        <span className="gallery-cat">{item.categoryName}</span>
      </div>
    </Link>
  );
}
