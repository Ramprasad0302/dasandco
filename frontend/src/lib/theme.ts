import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "das-theme";

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("light", theme === "light");
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore (private browsing / storage disabled)
  }
}

/**
 * Site-wide light/dark theme hook. Applies to the whole app (marketing
 * homepage + the private studio management system) via a single `.light`
 * class on <html>, persisted to localStorage so it's remembered across
 * pages and visits.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);

  useEffect(() => {
    setThemeState(getStoredTheme());
  }, []);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    applyTheme(next);
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return { theme, setTheme, toggleTheme };
}
