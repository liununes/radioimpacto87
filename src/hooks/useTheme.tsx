import { useState, useEffect } from "react";
import { getSiteConfig } from "@/lib/radioStore";
import { getThemeConfig, applyTheme, type ThemeConfig } from "@/lib/themeStore";

export function useTheme() {
  const [theme, setTheme] = useState<ThemeConfig>(getThemeConfig());

  useEffect(() => {
    const fetchTheme = async () => {
      const savedTheme = await getSiteConfig("theme");
      if (savedTheme) {
        setTheme(prev => ({ 
          ...prev, 
          ...savedTheme,
          labels: { ...prev.labels, ...(savedTheme.labels || {}) }
        }));
        applyTheme({ ...getThemeConfig(), ...savedTheme });
      }
    };
    fetchTheme();
  }, []);

  return theme;
}
