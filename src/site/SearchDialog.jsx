import { useEffect, useMemo, useRef, useState } from 'react';
import { CornerDownLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { categories } from '../library/registry';

const MAX_RESULTS = 8;
const DEFAULT_RESULTS = 6;

const buildIndex = () =>
  categories.flatMap(category =>
    category.components.map(component => ({
      name: component.name,
      description: component.description,
      categoryName: category.name,
      path: component.path
    }))
  );

const INDEX = buildIndex();

export default function SearchDialog({ open, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) return INDEX.slice(0, DEFAULT_RESULTS);

    return INDEX.filter(item =>
      [item.name, item.description, item.categoryName].some(value =>
        (value ?? '').toLowerCase().includes(keyword)
      )
    ).slice(0, MAX_RESULTS);
  }, [query]);

  useEffect(() => {
    if (!open) return undefined;

    setQuery('');
    setActiveIndex(0);
    const timer = setTimeout(() => inputRef.current?.focus(), 0);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const active = listRef.current?.querySelector('.search-item.is-active');
    active?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!open) return null;

  const go = item => {
    if (!item) return;
    onClose();
    navigate(item.path);
  };

  const onKeyDown = event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex(index => (results.length === 0 ? 0 : (index + 1) % results.length));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(index => (results.length === 0 ? 0 : (index - 1 + results.length) % results.length));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      go(results[activeIndex]);
    }
  };

  return (
    <div className="search-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="search-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="搜索组件"
        onMouseDown={event => event.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="search-input-row">
          <Search size={15} />
          <input
            ref={inputRef}
            className="search-input"
            type="text"
            value={query}
            placeholder="搜索组件名、描述或分类…"
            aria-label="搜索组件"
            onChange={event => setQuery(event.target.value)}
          />
          <kbd className="search-kbd">Esc</kbd>
        </div>

        <div className="search-list" ref={listRef} role="listbox" aria-label="搜索结果">
          {results.length === 0 && <p className="search-empty">没有匹配的组件，换个关键词试试。</p>}

          {results.map((item, index) => (
            <button
              key={item.path}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              className={`search-item${index === activeIndex ? ' is-active' : ''}`}
              onClick={() => go(item)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <span className="search-item-main">
                <span className="search-item-name">{item.name}</span>
                <span className="search-item-desc">{item.description}</span>
              </span>
              <span className="search-item-cat">{item.categoryName}</span>
            </button>
          ))}
        </div>

        <div className="search-foot">
          <span>
            <kbd className="search-kbd">↑</kbd>
            <kbd className="search-kbd">↓</kbd> 选择
          </span>
          <span>
            <kbd className="search-kbd">
              <CornerDownLeft size={10} />
            </kbd>
            打开
          </span>
        </div>
      </div>
    </div>
  );
}
