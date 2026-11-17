import { ChevronDown, ChevronUp } from 'lucide-react';
import CodeBlock from '../CodeBlock';
import CopyButton from '../CopyButton';

/**
 * 受控的源码折叠面板：文件 Tab 由注册表派生（示例文件 → 组件源码 → 样式）
 */
export default function SourcePanel({ files = [], expanded, onExpandedChange, activeFile, onActiveFileChange, highlightRange = null }) {
  if (files.length === 0) return null;

  const currentName = files.some(file => file.name === activeFile) ? activeFile : files[0].name;
  const current = files.find(file => file.name === currentName) ?? files[0];

  return (
    <section className="sp">
      <div className="sp-bar">
        <div className="sp-tabs">
          {expanded ? (
            <div className="sp-files">
              {files.map(file => (
                <button
                  key={file.name}
                  type="button"
                  className={`sp-file${file.name === currentName ? ' is-active' : ''}`}
                  aria-pressed={file.name === currentName}
                  onClick={() => onActiveFileChange?.(file.name)}
                >
                  {file.name}
                </button>
              ))}
            </div>
          ) : (
            <span className="sp-label">源码</span>
          )}
        </div>

        <div className="sp-bar-actions">
          {expanded && current && <CopyButton text={current.code} />}
          <button type="button" className="sp-toggle" aria-expanded={expanded} onClick={() => onExpandedChange(!expanded)}>
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {expanded ? '收起' : `展开 · ${files.length} 个文件`}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="sp-code">
          <CodeBlock code={current?.code} lang={current?.lang} highlightRange={highlightRange} />
        </div>
      )}
    </section>
  );
}
