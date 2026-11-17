import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import ApiTable from '../doc/ApiTable';
import DocToc from '../doc/DocToc';
import DemoSection from '../doc/DemoSection';
import SourcePanel from '../doc/SourcePanel';
import { MobileCategories } from '../Sidebar';
import usePageMeta from '../usePageMeta';
import { findCategory, findComponent, findComponentBySlug } from '../../library/registry';
import NotFoundPage from './NotFoundPage';

const STATUS_LABEL = { stable: 'Stable', beta: 'Beta', deprecated: 'Deprecated' };

const TOC_BASE = [
  { id: 'examples', label: '示例' },
  { id: 'api', label: 'API' },
  { id: 'source', label: '源码' }
];

const RelatedCard = ({ item }) => {
  const Preview = useMemo(() => (item.preview || item.load ? lazy(item.preview || item.load) : null), [item]);
  if (!Preview) return null;

  return (
    <Link className="related-card" to={item.path}>
      <div className="related-stage" inert aria-hidden="true">
        <Suspense fallback={null}>
          <Preview />
        </Suspense>
      </div>
      <span className="related-name">{item.name}</span>
    </Link>
  );
};

export default function ComponentPage() {
  const { category: categorySlug, component: componentSlug } = useParams();
  const navigate = useNavigate();

  const category = findCategory(categorySlug);
  const component = findComponent(categorySlug, componentSlug);
  const owner = useMemo(() => findComponentBySlug(componentSlug), [componentSlug]);

  const [sourceOpen, setSourceOpen] = useState(false);
  const [sourceFile, setSourceFile] = useState(null);
  const [highlightRange, setHighlightRange] = useState(null);
  const [scrollNonce, setScrollNonce] = useState(0);

  const related = useMemo(() => {
    if (!component?.related?.length) return [];
    return component.related
      .map(path => {
        const [relatedCategory, relatedComponent] = path.split('/');
        return findComponent(relatedCategory, relatedComponent);
      })
      .filter(Boolean);
  }, [component]);

  const tocItems = useMemo(
    () => (related.length > 0 ? [...TOC_BASE, { id: 'related', label: '相关组件' }] : TOC_BASE),
    [related.length]
  );

  // 切换组件时重置源码区，并支持 #code=<file> / ?example=<slug> 深链
  useEffect(() => {
    if (!component) return;

    setSourceOpen(false);
    setSourceFile(null);
    setHighlightRange(null);

    const hash = window.location.hash;
    const codeFile = hash.startsWith('#code=') ? decodeURIComponent(hash.slice(6)) : null;
    const targetFile = codeFile ? component.codeFiles.find(file => file.name === codeFile) : null;
    if (targetFile) {
      setSourceFile(targetFile.name);
      setHighlightRange(targetFile.range ?? null);
      setSourceOpen(true);
      setScrollNonce(count => count + 1);
    }

    const exampleSlug = new URLSearchParams(window.location.search).get('example');
    if (exampleSlug && component.examples.some(example => example.slug === exampleSlug)) {
      requestAnimationFrame(() => {
        document.getElementById(`example-${exampleSlug}`)?.scrollIntoView({ block: 'center' });
      });
    }
  }, [component]);

  useEffect(() => {
    if (!scrollNonce) return;
    document.getElementById('source')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [scrollNonce]);

  // ←/→ 切换同分类上下篇
  useEffect(() => {
    if (!component) return undefined;

    const onKeyDown = event => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (target instanceof Element && target.closest('input, textarea, select, [contenteditable="true"]')) return;

      if (event.key === 'ArrowLeft' && component.prev) {
        event.preventDefault();
        navigate(component.prev.path);
      } else if (event.key === 'ArrowRight' && component.next) {
        event.preventDefault();
        navigate(component.next.path);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [component, navigate]);

  // 组件不存在时交给 NotFoundPage 设置标题，避免父级覆盖
  usePageMeta(
    component
      ? { title: `${component.name} · Soren UI`, description: component.description || 'Soren UI 组件文档' }
      : { title: null, description: null }
  );

  if (!category) return <NotFoundPage />;
  if (!component) {
    if (owner) return <Navigate to={owner.path} replace />;
    return <NotFoundPage />;
  }

  const showSource = (file, range) => {
    setSourceFile(file);
    setHighlightRange(range ?? null);
    setSourceOpen(true);
    setScrollNonce(count => count + 1);
    window.history.replaceState(null, '', `#code=${encodeURIComponent(file)}`);
  };

  const fallbackDemo = component.examples.length === 0 ? component.load : null;

  return (
    <div className="sn-content doc-layout">
      <div className="doc-main">
        <MobileCategories />

        <header className="sn-head">
          <nav className="doc-breadcrumb" aria-label="Breadcrumb">
            <Link to={`/c/${category.slug}`}>{category.name}</Link>
            <ChevronRight size={12} />
            <span aria-current="page">{component.name}</span>
          </nav>

          <h1 className="sn-title">{component.name}</h1>
          {component.description && <p className="sn-desc">{component.description}</p>}

          <div className="doc-meta">
            <span className={`doc-badge doc-badge--${component.status}`}>
              {STATUS_LABEL[component.status] ?? component.status}
            </span>
            {component.since && <span className="doc-meta-item">since {component.since}</span>}
          </div>
        </header>

        <section className="doc-section" id="examples" aria-labelledby="doc-examples">
          <h2 className="doc-section-title" id="doc-examples">
            示例
          </h2>
          <DemoSection examples={component.examples} fallback={fallbackDemo} onShowSource={showSource} />
        </section>

        <section className="doc-section" id="api" aria-labelledby="doc-api">
          <h2 className="doc-section-title" id="doc-api">
            API
          </h2>
          <ApiTable props={component.props} />
        </section>

        <section className="doc-section" id="source" aria-labelledby="doc-source">
          <h2 className="doc-section-title" id="doc-source">
            源码
          </h2>
          <SourcePanel
            files={component.codeFiles}
            expanded={sourceOpen}
            onExpandedChange={setSourceOpen}
            activeFile={sourceFile}
            highlightRange={highlightRange}
            onActiveFileChange={file => {
              setSourceFile(file);
              setHighlightRange(null);
            }}
          />
        </section>

        {related.length > 0 && (
          <section className="doc-section" id="related" aria-labelledby="doc-related">
            <h2 className="doc-section-title" id="doc-related">
              相关组件
            </h2>
            <div className="related-grid">
              {related.map(item => (
                <RelatedCard key={item.path} item={item} />
              ))}
            </div>
          </section>
        )}

        {(component.prev || component.next) && (
          <nav className="doc-pager" aria-label="组件翻页">
            {component.prev ? (
              <Link className="doc-pager-link" to={component.prev.path}>
                <span className="doc-pager-label">
                  <ChevronLeft size={12} />
                  上一页
                </span>
                <span className="doc-pager-name">{component.prev.name}</span>
              </Link>
            ) : (
              <span />
            )}

            {component.next ? (
              <Link className="doc-pager-link doc-pager-link--next" to={component.next.path}>
                <span className="doc-pager-label">
                  下一页
                  <ChevronRight size={12} />
                </span>
                <span className="doc-pager-name">{component.next.name}</span>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </div>

      <DocToc items={tocItems} />
    </div>
  );
}
