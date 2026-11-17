import { Link } from 'react-router-dom';
import usePageMeta from '../usePageMeta';
import { categories } from '../../library/registry';

export default function ToolsPage() {
  usePageMeta({ title: 'Tools · Soren UI', description: '工具区（预留）' });

  return (
    <div className="sn-docpage">
      <div className="sn-content">
          <header className="sn-head">
            <p className="sn-eyebrow">Tools</p>
            <h1 className="sn-title">工具区（预留）</h1>
            <p className="sn-desc">这里留给之后自己加的小工具，现在只保留入口。下面是现有分类的快捷跳转。</p>
          </header>

          <div className="sn-grid">
            {categories.map(category => (
              <Link className="sn-card" key={category.slug} to={`/c/${category.slug}`}>
                <span className="sn-card-name">{category.name}</span>
                <span className="sn-card-desc">{category.description || '—'}</span>
                <span className="sn-card-meta">{category.components.length} components</span>
              </Link>
            ))}
          </div>
        </div>
    </div>
  );
}
