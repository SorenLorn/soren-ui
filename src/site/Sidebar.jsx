import { NavLink, useParams } from 'react-router-dom';
import { categories } from '../library/registry';

export function Sidebar() {
  const { category: activeCategory, component } = useParams();

  return (
    <aside className="sn-sidebar" aria-label="Components">
      {categories.map(category => {
        const isCurrent = category.slug === activeCategory;

        return (
          <div className="sn-group" key={category.slug}>
            <NavLink
              to={`/c/${category.slug}`}
              className={`sn-group-title${isCurrent && !component ? ' is-active' : ''}`}
              title={category.description}
            >
              <span>{category.name}</span>
              <span className="sn-group-count">{category.components.length}</span>
            </NavLink>

            {category.components.map(item => (
              <NavLink
                key={item.slug}
                to={item.path}
                className={({ isActive }) => `sn-item${isActive ? ' is-active' : ''}`}
              >
                {item.name}
              </NavLink>
            ))}
          </div>
        );
      })}
    </aside>
  );
}

/** 窄屏下的分类横向条，替代侧栏 */
export function MobileCategories() {
  const { category: activeCategory } = useParams();

  return (
    <nav className="sn-mobile-nav" aria-label="Categories">
      {categories.map(category => (
        <NavLink
          key={category.slug}
          to={`/c/${category.slug}`}
          className={`sn-chip${category.slug === activeCategory ? ' is-active' : ''}`}
        >
          {category.name}
        </NavLink>
      ))}
    </nav>
  );
}
