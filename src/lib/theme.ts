import { useCallback, useEffect, useState } from "react";
import { load, save } from "./storage";

type Theme = "light" | "dark" | "auto";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => load<Theme>("jalursuka:theme", "auto"));
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
    save("jalursuka:theme", theme);
  }, [theme]);
  const toggle = useCallback(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const effective = theme === "auto" ? (prefersDark ? "dark" : "light") : theme;
    setTheme(effective === "dark" ? "light" : "dark");
  }, [theme]);
  const effectiveDark =
    theme === "dark" || (theme === "auto" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  return { toggle, dark: effectiveDark };
}
