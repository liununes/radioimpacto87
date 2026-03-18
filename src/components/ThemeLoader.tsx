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
      const [saved, radioConfig] = await Promise.all([
        getSiteConfig("theme"),
        getSiteConfig("streaming")
      ]);

      if (saved) {
        applyTheme(saved);
        saveThemeConfig(saved);
      }

      if (radioConfig?.favicon) {
        let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = radioConfig.favicon;
      }
    };
    syncTheme();
  }, []);
  return null;
};

export default ThemeLoader;
