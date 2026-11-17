import { useParams } from 'react-router-dom';
import GalleryCard from '../GalleryCard';
import { MobileCategories } from '../Sidebar';
import usePageMeta from '../usePageMeta';
import { findCategory } from '../../library/registry';
import NotFoundPage from './NotFoundPage';

export default function CategoryPage() {
  const { category: categorySlug } = useParams();
  const category = findCategory(categorySlug);

  // 分类不存在时交给 NotFoundPage 设置标题
  usePageMeta(
    category
      ? { title: `${category.name} · Soren UI`, description: category.description || 'Soren UI 组件分类' }
      : { title: null, description: null }
  );

  if (!category) return <NotFoundPage />;

  return (
    <div className="sn-content">
      <MobileCategories />

      <header className="sn-head">
        <p className="sn-eyebrow">Category</p>
        <h1 className="sn-title">{category.name}</h1>
        {category.description && <p className="sn-desc">{category.description}</p>}
      </header>

      {category.components.length === 0 ? (
        <p className="sn-empty">
          这个分类还没有组件。在 <code className="sd-inline-code">src/library/{category.slug}/</code> 下新建组件目录即可自动出现。
        </p>
      ) : (
        <div className="gallery-grid">
          {category.components.map(component => (
            <GalleryCard key={component.slug} item={component} />
          ))}
        </div>
      )}
    </div>
  );
}
