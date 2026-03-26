import { useState, useEffect } from "react";
import { getSiteConfig } from "@/lib/radioStore";
import { getThemeConfig, applyTheme, type ThemeConfig } from "@/lib/themeStore";

export function useTheme() {
  const [theme, setTheme] = useState<ThemeConfig>(getThemeConfig());

  useEffect(() => {
    const fetchTheme = async () => {
      const [savedTheme, streaming] = await Promise.all([
        getSiteConfig("theme"),
        getSiteConfig("streaming")
      ]);

      setTheme(prev => ({ 
        ...prev, 
        ...savedTheme,
        // Branding from streaming/radioConfig
        logo: streaming?.logo || savedTheme?.logo || "",
        radioName: streaming?.radioName || savedTheme?.radioName || "IMPACTO",
        favicon: streaming?.favicon || savedTheme?.favicon || "",
        radioFreq: streaming?.radioFreq || savedTheme?.radioFreq || prev.radioFreq,
        labels: { ...prev.labels, ...(savedTheme?.labels || {}) }
      }));

      if (savedTheme) {
        applyTheme({ ...getThemeConfig(), ...savedTheme });
      }
    };
    fetchTheme();
  }, []);

  return theme;
}
