import { createContext, useContext, useMemo, type ReactNode } from "react";

/**
 * Theme is locked to LIGHT in the v2 design.
 * The provider is kept (with a no-op API) so existing imports keep compiling.
 */
export type Theme = "light";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: "light",
      setTheme: () => {},
      toggleTheme: () => {},
    }),
    [],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

/**
 * Pre-hydration script — força tema claro globalmente, garante color-scheme
 * e atualiza meta tags de status bar para combinar com o canvas off-white.
 */
export const THEME_BOOTSTRAP = `(function(){try{
var d=document.documentElement;
d.classList.remove('dark');
d.style.colorScheme='light';
var h=document.head;
function set(n,c){var m=h.querySelector('meta[name="'+n+'"]:not([media])');if(!m){m=document.createElement('meta');m.setAttribute('name',n);h.appendChild(m)}m.setAttribute('content',c)}
set('theme-color','#f7f7f8');
set('apple-mobile-web-app-status-bar-style','default');
set('color-scheme','light');
}catch(e){}})();`;
