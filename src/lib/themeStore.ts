// Store for theme/colors customization
export interface ThemeConfig {
  background: string;
  foreground: string;
  card: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  headerBg: string;
  navBg: string;
  // Gradients
  primaryGradient?: string;
  secondaryGradient?: string;
  backgroundGradient?: string;
  headerGradient?: string;
  // Layout
  topSongsPosition: 'hero' | 'gallery' | 'news' | 'contact';
  pedidoPosition: 'left' | 'center' | 'right';
  playerPosition: 'left' | 'center' | 'right';
  // Visibility toggles
  showTopSongs: boolean;
  showGallery: boolean;
  showNews: boolean;
  showAbout: boolean;
  showWeather: boolean;
  showSponsors: boolean;
  showBackToTop: boolean;
  // Weather settings
  weatherCity: string;
  // Sponsor settings
  sponsorsPosition: 'left' | 'center' | 'right';
  topSongsAlignment: 'left' | 'center' | 'right';
  weatherPosition: 'left' | 'center' | 'right';
}

export interface SiteConfig {
  streamUrl: string;
  radioName: string;
  radioFreq: string;
  logo: string; // base64 or URL
}

const THEME_KEY = "radio_theme";
const SITE_KEY = "radio_streaming_config";

export const DEFAULT_THEME: ThemeConfig = {
  background: "220 20% 14%",
  foreground: "0 0% 98%",
  card: "220 20% 18%",
  primary: "217 91% 60%",
  primaryForeground: "0 0% 100%",
  secondary: "45 93% 58%",
  secondaryForeground: "220 20% 10%",
  muted: "220 15% 25%",
  mutedForeground: "220 10% 60%",
  border: "220 15% 25%",
  headerBg: "220 20% 10%",
  navBg: "220 15% 20%",
  primaryGradient: "linear-gradient(135deg, hsl(217, 91%, 60%) 0%, hsl(217, 91%, 40%) 100%)",
  secondaryGradient: "linear-gradient(135deg, hsl(45, 93%, 58%) 0%, hsl(45, 93%, 38%) 100%)",
  topSongsPosition: 'hero',
  pedidoPosition: 'center',
  playerPosition: 'center',
  // Visibility toggles
  showTopSongs: true,
  showGallery: true,
  showNews: true,
  showAbout: true,
  showWeather: true,
  showSponsors: true,
  showBackToTop: true,
  // Weather settings
  weatherCity: 'São Paulo',
  // Sponsor settings
  sponsorsPosition: 'center',
  topSongsAlignment: 'center',
  weatherPosition: 'left',
};

export function getThemeConfig(): ThemeConfig {
  try {
    const saved = JSON.parse(localStorage.getItem(THEME_KEY) || "{}");
    return { ...DEFAULT_THEME, ...saved };
  } catch { return { ...DEFAULT_THEME }; }
}

export function saveThemeConfig(config: ThemeConfig) {
  localStorage.setItem(THEME_KEY, JSON.stringify(config));
  applyTheme(config);
}

export function applyTheme(config: ThemeConfig) {
  const root = document.documentElement;
  root.style.setProperty("--background", config.background);
  root.style.setProperty("--foreground", config.foreground);
  root.style.setProperty("--card", config.card);
  root.style.setProperty("--card-foreground", config.foreground);
  root.style.setProperty("--popover", config.card);
  root.style.setProperty("--popover-foreground", config.foreground);
  root.style.setProperty("--primary", config.primary);
  root.style.setProperty("--primary-foreground", config.primaryForeground);
  root.style.setProperty("--secondary", config.secondary);
  root.style.setProperty("--secondary-foreground", config.secondaryForeground);
  root.style.setProperty("--muted", config.muted);
  root.style.setProperty("--muted-foreground", config.mutedForeground);
  root.style.setProperty("--accent", config.primary);
  root.style.setProperty("--accent-foreground", config.primaryForeground);
  root.style.setProperty("--border", config.border);
  root.style.setProperty("--input", config.border);
  root.style.setProperty("--ring", config.primary);
  root.style.setProperty("--header-bg", config.headerBg);
  root.style.setProperty("--nav-bg", config.navBg);

  // Apply Gradients
  if (config.primaryGradient) root.style.setProperty("--primary-gradient", config.primaryGradient);
  else root.style.setProperty("--primary-gradient", `hsl(${config.primary})`);

  if (config.secondaryGradient) root.style.setProperty("--secondary-gradient", config.secondaryGradient);
  else root.style.setProperty("--secondary-gradient", `hsl(${config.secondary})`);

  if (config.backgroundGradient) root.style.setProperty("--background-gradient", config.backgroundGradient);
  else root.style.setProperty("--background-gradient", `hsl(${config.background})`);

  if (config.headerGradient) root.style.setProperty("--header-gradient", config.headerGradient);
  else root.style.setProperty("--header-gradient", `hsl(${config.headerBg})`);
}

export function getSiteConfig(): SiteConfig {
  try {
    const saved = JSON.parse(localStorage.getItem(SITE_KEY) || "{}");
    return {
      streamUrl: saved.streamUrl || "https://stream.zeno.fm/yn65fsaurfhvv",
      radioName: saved.radioName || "Impacto FM",
      radioFreq: saved.radioFreq || "87.9 FM",
      logo: saved.logo || "/logo.png",
    };
  } catch {
    return { streamUrl: "https://stream.zeno.fm/yn65fsaurfhvv", radioName: "Impacto FM", radioFreq: "87.9 FM", logo: "/logo.png" };
  }
}

export function saveSiteConfig(config: SiteConfig) {
  localStorage.setItem(SITE_KEY, JSON.stringify(config));
}
