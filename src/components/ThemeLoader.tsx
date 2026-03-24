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
        // Favicon principal
        let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = radioConfig.favicon;

        // Apple Touch Icon
        let appleLink: HTMLLinkElement | null = document.querySelector("link[rel='apple-touch-icon']");
        if (!appleLink) {
          appleLink = document.createElement('link');
          appleLink.rel = 'apple-touch-icon';
          document.getElementsByTagName('head')[0].appendChild(appleLink);
        }
        appleLink.href = radioConfig.favicon;
      }
    };
    syncTheme();
  }, []);
  return null;
};

export default ThemeLoader;
