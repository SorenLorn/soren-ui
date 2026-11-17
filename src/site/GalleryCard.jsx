import { Suspense, lazy, useMemo } from 'react';
import { Link } from 'react-router-dom';

/**
 * 参考站风格的展示卡：大尺寸预览面板 + 下方信息行（名称 / 分类）
 * 预览面板固定深色，内部不可交互，整卡作为链接
 */
export default function GalleryCard({ item }) {
  const Preview = useMemo(() => {
    const loader = item.preview || item.load;
    return loader ? lazy(loader) : null;
  }, [item]);

  return (
    <Link className="gallery-card" to={item.path} aria-label={item.name}>
      <div className="gallery-frame" inert aria-hidden="true">
        {Preview && (
          <Suspense fallback={null}>
            <Preview />
          </Suspense>
        )}
      </div>

      <div className="gallery-meta">
        <span className="gallery-name">{item.name}</span>
        <span className="gallery-cat">{item.categoryName}</span>
      </div>
    </Link>
  );
}
