'use client';

import { ThemeProvider, useTheme } from 'next-themes';
import { useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

const STORAGE_KEY = 'soren-ui-theme';

function ThemeKeyboardShortcut() {
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const onKeyDown = event => {
      if (event.defaultPrevented || event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key.toLowerCase();
      if (key !== 'd' && key !== 't') return;

      const target = event.target;
      const isEditing =
        target instanceof Element && target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])');
      if (isEditing) return;

      event.preventDefault();
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [resolvedTheme, setTheme]);

  return null;
}

export function ColorModeProvider({ children, ...props }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem={false}
      themes={['dark', 'light']}
      storageKey={STORAGE_KEY}
      disableTransitionOnChange
      {...props}
    >
      <ThemeKeyboardShortcut />
      {children}
    </ThemeProvider>
  );
}

export function useColorMode() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return {
    theme,
    resolvedTheme,
    setColorMode: setTheme,
    toggleColorMode: () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  };
}

export function ColorModeIcon() {
  const { resolvedTheme } = useColorMode();
  return resolvedTheme === 'dark' ? <Moon /> : <Sun />;
}
