import { useEffect, useMemo, useRef } from 'react';
import { toLines, tokenize } from './highlight';

/** @param {{ start: number, end: number }|null} highlightRange 1-based 行号区间 */
export default function CodeBlock({ code, lang = 'jsx', highlightRange = null }) {
  const containerRef = useRef(null);
  const lines = useMemo(() => toLines(tokenize(code ?? '', lang)), [code, lang]);
  const start = highlightRange?.start ?? 0;
  const end = highlightRange?.end ?? 0;

  // 有高亮区间时把首行滚到可视区（只滚动代码容器，不带动整页）
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !highlightRange) return;

    const target = container.querySelector('.code-line.is-hl');
    if (!target) return;

    const delta = target.getBoundingClientRect().top - container.getBoundingClientRect().top;
    container.scrollTop = Math.max(0, container.scrollTop + delta - 60);
  }, [highlightRange, code]);

  return (
    <div className="sp-code-body" ref={containerRef}>
      {lines.map((line, lineIndex) => {
        const lineNumber = lineIndex + 1;
        const highlighted = lineNumber >= start && lineNumber <= end;

        return (
          <div className={`code-line${highlighted ? ' is-hl' : ''}`} key={lineIndex}>
            <span className="code-ln">{lineNumber}</span>
            <span className="code-txt">
              {line.length === 0
                ? '\u00A0'
                : line.map((token, tokenIndex) =>
                    token.className ? (
                      <span key={tokenIndex} className={token.className}>
                        {token.text}
                      </span>
                    ) : (
                      <span key={tokenIndex}>{token.text}</span>
                    )
                  )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
