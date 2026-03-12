import { useEffect } from "react";
import { applyTheme, getThemeConfig, saveThemeConfig } from "@/lib/themeStore";
import { getSiteConfig } from "@/lib/radioStore";

/** Loads and applies saved theme on mount */
const ThemeLoader = () => {
  useEffect(() => {
    // Apply local theme immediately for no flash
    applyTheme(getThemeConfig());

    // Then sync with Supabase
    const syncTheme = async () => {
      const saved = await getSiteConfig("theme");
      if (saved) {
        applyTheme(saved);
        saveThemeConfig(saved); // Sync back to localStorage
      }
    };
    syncTheme();
  }, []);
  return null;
};

export default ThemeLoader;
