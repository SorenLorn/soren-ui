/**
 * 从示例源码里提炼「用法片段」：
 * - extractSnippet：取 `return (` … `)` 之间的 JSX，并算出行号区间（用于源码定位高亮）
 * - buildUsage：生成「复制用法」的文本
 *     · 无本地 hook（无状态）→ import 语句 + JSX 片段（最小可用）
 *     · 有 hook / 取不到片段 → 回退整份示例文件（保证可运行）
 */
const IMPORT_RE = /^[ \t]*import[\s\S]*?;[ \t]*$/gm;
const HOOK_RE = /\buse(?:State|Reducer|Effect|Ref|Memo|Callback|Id)\s*\(/;

const lineOf = (code, index) => code.slice(0, index).split('\n').length;

const dedent = text => {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const indents = lines.filter(line => line.trim()).map(line => line.match(/^[ \t]*/)[0].length);
  const min = indents.length > 0 ? Math.min(...indents) : 0;
  return lines
    .map(line => line.slice(min))
    .join('\n')
    .trim();
};

export function extractSnippet(code) {
  const match = /\breturn\s*\(/.exec(code);
  if (!match) return null;

  const openIndex = match.index + match[0].length - 1;
  let depth = 0;
  let closeIndex = -1;

  for (let index = openIndex; index < code.length; index += 1) {
    const char = code[index];
    if (char === '(') depth += 1;
    else if (char === ')') {
      depth -= 1;
      if (depth === 0) {
        closeIndex = index;
        break;
      }
    }
  }

  if (closeIndex === -1) return null;

  const openLine = lineOf(code, openIndex);
  const closeLine = lineOf(code, closeIndex);
  const inner = code.slice(openIndex + 1, closeIndex);

  const range =
    closeLine - 1 >= openLine + 1
      ? { start: openLine + 1, end: closeLine - 1 }
      : { start: openLine, end: closeLine };

  return { code: dedent(inner), startLine: range.start, endLine: range.end };
}

export function buildUsage(code, snippet) {
  const imports = code.match(IMPORT_RE)?.join('\n').trim() ?? '';
  const hasHooks = HOOK_RE.test(code);

  if (!snippet || hasHooks) {
    return { text: code.trimEnd(), kind: 'file' };
  }

  return {
    text: imports ? `${imports}\n\n${snippet.code}\n` : `${snippet.code}\n`,
    kind: 'snippet'
  };
}
