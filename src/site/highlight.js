/**
 * 零依赖分词器：把源码切成 [{ text, className }]
 * - 采用 sticky 正则按位置匹配，避免 replace 破坏内容
 * - JS/JSX 与 CSS 两套规则
 */
const JS_RULES = [
  ['tk-com', /\/\*[\s\S]*?\*\/|\/\/[^\n]*/y],
  ['tk-str', /'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`/y],
  [
    'tk-kw',
    /\b(?:import|from|export|default|const|let|var|function|return|if|else|for|while|new|class|extends|async|await|typeof|instanceof|switch|case|break|continue|try|catch|finally|throw|delete|in|of|yield)\b/y
  ],
  ['tk-num', /\b\d+(?:\.\d+)?\b/y],
  ['tk-tag', /<\/?[A-Za-z][\w.]*/y],
  ['tk-fn', /\b[A-Za-z_$][\w$]*(?=\s*\()/y]
];

const CSS_RULES = [
  ['tk-com', /\/\*[\s\S]*?\*\//y],
  ['tk-str', /'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"/y],
  ['tk-kw', /@[\w-]+/y],
  ['tk-tag', /--[\w-]+/y],
  ['tk-num', /#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|rem|em|%|s|ms|vh|vw|fr|deg)?\b/y],
  ['tk-fn', /[A-Za-z-]+(?=\()/y]
];

export function tokenize(code, lang = 'jsx') {
  const rules = lang === 'css' ? CSS_RULES : JS_RULES;
  const tokens = [];
  let plain = '';
  let index = 0;

  while (index < code.length) {
    let matched = null;

    for (const [className, pattern] of rules) {
      pattern.lastIndex = index;
      const result = pattern.exec(code);
      if (result && result[0].length > 0) {
        matched = { text: result[0], className };
        break;
      }
    }

    if (matched) {
      if (plain) {
        tokens.push({ text: plain });
        plain = '';
      }
      tokens.push(matched);
      index += matched.text.length;
    } else {
      plain += code[index];
      index += 1;
    }
  }

  if (plain) tokens.push({ text: plain });
  return tokens;
}

/** tokens → 按行分组，供带行号的渲染使用 */
export function toLines(tokens) {
  const lines = [[]];

  for (const token of tokens) {
    token.text.split('\n').forEach((part, partIndex) => {
      if (partIndex > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ text: part, className: token.className });
    });
  }

  return lines;
}
