import { Suspense, lazy, useMemo, useState } from 'react';
import { Code2, RotateCcw } from 'lucide-react';
import CopyButton from '../CopyButton';

function DemoCard({ id, title, load, usage, range, sourceFile, onShowSource }) {
  const [nonce, setNonce] = useState(0);
  const Preview = useMemo(() => (load ? lazy(load) : null), [load]);

  if (!Preview) return null;

  const copyText = usage?.text ?? '';
  const copyTitle = usage?.kind === 'snippet' ? '复制最小用法片段（含 import）' : '复制完整示例文件（含状态逻辑）';

  return (
    <article className="sp" id={id}>
      <div className="sp-bar">
        <span className="demo-card-title">{title}</span>
        <div className="sp-bar-actions">
          <button type="button" className="sp-ghost" onClick={() => setNonce(count => count + 1)}>
            <RotateCcw size={12} />
            重置
          </button>
          {copyText && <CopyButton text={copyText} label="复制用法" variant="ghost" title={copyTitle} />}
          {sourceFile && onShowSource && (
            <button type="button" className="sp-ghost" onClick={() => onShowSource(sourceFile, range)}>
              <Code2 size={12} />
              源码
            </button>
          )}
        </div>
      </div>

      <div className="sp-preview sp-preview--demo">
        <div className="sp-preview-inner">
          <Suspense fallback={null}>
            <Preview key={nonce} />
          </Suspense>
        </div>
      </div>
    </article>
  );
}

/**
 * @param {{ slug: string, name: string, load: Function, usage: object, snippet: object|null }[]} examples
 * @param {Function|null} fallback 无 examples 时退回 demo.jsx
 */
export default function DemoSection({ examples = [], fallback = null, fallbackTitle = 'Basic', onShowSource }) {
  if (examples.length === 0 && !fallback) {
    return (
      <p className="doc-empty">
        还没有可运行示例。在组件目录下新建 <code className="sd-inline-code">examples/basic.jsx</code> 即可自动出现。
      </p>
    );
  }

  return (
    <div className="demo-stack">
      {examples.map(example => (
        <DemoCard
          key={example.slug}
          id={`example-${example.slug}`}
          title={example.name}
          load={example.load}
          usage={example.usage}
          range={example.range}
          sourceFile={example.file}
          onShowSource={onShowSource}
        />
      ))}

      {examples.length === 0 && fallback && <DemoCard title={fallbackTitle} load={fallback} />}
    </div>
  );
}
