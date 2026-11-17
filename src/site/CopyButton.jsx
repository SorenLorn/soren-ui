import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

async function writeToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      /* 回退到 execCommand */
    }
  }

  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  document.execCommand('copy');
  document.body.removeChild(area);
}

export default function CopyButton({ text, label = 'Copy code', variant = 'default', title }) {
  const [done, setDone] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleCopy = async () => {
    await writeToClipboard(text);
    setDone(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setDone(false), 2000);
  };

  return (
    <button
      type="button"
      className={`sp-copy${variant === 'ghost' ? ' sp-copy--ghost' : ''}${done ? ' is-done' : ''}`}
      onClick={handleCopy}
      title={title}
      aria-live="polite"
    >
      {done ? <Check size={13} /> : <Copy size={13} />}
      <span>{done ? 'Copied' : label}</span>
    </button>
  );
}
