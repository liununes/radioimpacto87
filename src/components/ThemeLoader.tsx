import { useEffect } from "react";
import { applyTheme, getThemeConfig } from "@/lib/themeStore";

/** Loads and applies saved theme on mount */
const ThemeLoader = () => {
  useEffect(() => {
    applyTheme(getThemeConfig());
  }, []);
  return null;
};

export default ThemeLoader;
