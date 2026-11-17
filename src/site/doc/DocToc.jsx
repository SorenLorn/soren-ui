import { useEffect, useState } from 'react';

/** 右侧本页目录：≥1280px 显示（由 CSS 控制），滚动时高亮当前段落 */
export default function DocToc({ items = [] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? null);

  useEffect(() => {
    const sections = items.map(item => document.getElementById(item.id)).filter(Boolean);
    if (sections.length === 0) return undefined;

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(entry => entry.isIntersecting);
        if (visible.length === 0) return;
        const topmost = visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        setActiveId(topmost.target.id);
      },
      { rootMargin: '-88px 0px -60% 0px', threshold: [0, 1] }
    );

    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className="doc-toc" aria-label="本页目录">
      <p className="doc-toc-title">本页内容</p>
      {items.map(item => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={`doc-toc-link${activeId === item.id ? ' is-active' : ''}`}
          aria-current={activeId === item.id ? 'true' : undefined}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
