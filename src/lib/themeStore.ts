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
  // Text Colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textAccent: string;
  // Radio Config
  radioFreq: string;
  playerOpenUrl: string;
  // Brand Colors (Hex)
  clubeBlue: string;
  clubeYellow: string;
  clubeRed: string;
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
  // Dynamic Labels
  labels: {
    heroReadMore: string;
    heroMoreNews: string;
    newsTitle: string;
    newsSubtitle: string;
    topSongsTitle: string;
    topSongsSubtitle: string;
    galleryTitle: string;
    gallerySubtitle: string;
    aboutTitle: string;
    aboutSubtitle: string;
    playerLocation: string;
    playerLive: string;
    playerSchedule: string;
    playerOpen: string;
    navHome: string;
    navPromos: string;
    navEntertainment: string;
    navMusic: string;
    navSchedule: string;
    navAbout: string;
    navContact: string;
    footerAbout: string;
    footerRights: string;
    searchPlaceholder: string;
    btnMore: string;
    btnSend: string;
    labelOnAir: string;
  };
  navMenus?: { label: string; href: string }[];
  // Admin Panel (Back-end) Colors & Brand
  adminBlue: string;
  adminYellow: string;
  adminLogo?: string;
}

export const DEFAULT_THEME: ThemeConfig = {
  background: "0 0% 100%",
  foreground: "222.2 84% 4.9%",
  card: "0 0% 100%",
  primary: "211 100% 18%",
  primaryForeground: "210 40% 98%",
  secondary: "48 100% 50%",
  secondaryForeground: "222.2 47.4% 11.2%",
  muted: "210 40% 96.1%",
  mutedForeground: "215.4 16.3% 46.9%",
  border: "214.3 31.8% 91.4%",
  headerBg: "211 100% 18%",
  navBg: "211 100% 18%",
  textPrimary: "#002e5d",
  textSecondary: "#ffed32",
  textMuted: "#94a3b8",
  textAccent: "#ec2027",
  radioFreq: "87.9",
  playerOpenUrl: "/player",
  clubeBlue: "#002e5d",
  clubeYellow: "#ffed32",
  clubeRed: "#ec2027",
  topSongsPosition: 'hero',
  pedidoPosition: 'center',
  playerPosition: 'center',
  showTopSongs: true,
  showGallery: true,
  showNews: true,
  showAbout: true,
  showWeather: true,
  showSponsors: true,
  showBackToTop: true,
  weatherCity: 'Brasília',
  sponsorsPosition: 'center',
  topSongsAlignment: 'center',
  weatherPosition: 'left',
  navMenus: [
    { label: "AO VIVO", href: "#home" },
    { label: "PROMOÇÕES", href: "#promocoes" },
    { label: "ENTRETENIMENTO", href: "#entretenimento" },
    { label: "MÚSICA", href: "#musica" },
    { label: "PROGRAMAÇÃO", href: "#programacao" },
    { label: "A RÁDIO", href: "#sobre" },
    { label: "CONTATO", href: "#contato" },
  ],
  labels: {
    heroReadMore: "LEIA A NOTÍCIA",
    heroMoreNews: "MAIS NOTÍCIAS!",
    newsTitle: "Plantão",
    newsSubtitle: "Impacto",
    topSongsTitle: "Top 3",
    topSongsSubtitle: "Impacto",
    galleryTitle: "Momentos",
    gallerySubtitle: "Vips",
    aboutTitle: "Sobre a",
    aboutSubtitle: "Impacto",
    playerLocation: "Você está em:",
    playerLive: "AO VIVO",
    playerSchedule: "Ver Programação",
    playerOpen: "Abrir Player",
    navHome: "AO VIVO",
    navPromos: "PROMOÇÕES",
    navEntertainment: "ENTRETENIMENTO",
    navMusic: "MÚSICA",
    navSchedule: "PROGRAMAÇÃO",
    navAbout: "A RÁDIO",
    navContact: "CONTATO",
    footerAbout: "A rádio que toca você com a melhor programação, música de qualidade e informação em tempo real.",
    footerRights: "Todos os direitos reservados.",
    searchPlaceholder: "Buscar na rádio...",
    btnMore: "CARREGAR MAIS",
    btnSend: "ENVIAR PEDIDO",
    labelOnAir: "NO AR AGORA",
  },
  adminBlue: "#002e5d",
  adminYellow: "#ffed32",
};

export function getThemeConfig(): ThemeConfig {
  return { ...DEFAULT_THEME };
}

export function saveThemeConfig(config: ThemeConfig) {
  applyTheme(config);
}

export function applyTheme(config: ThemeConfig) {
  const root = document.documentElement;
  // HSL Variables
  root.style.setProperty("--background", config.background);
  root.style.setProperty("--foreground", config.foreground);
  root.style.setProperty("--primary", config.primary);
  root.style.setProperty("--secondary", config.secondary);
  root.style.setProperty("--accent", config.primary);
  root.style.setProperty("--border", config.border);
  
  // Custom Dynamic Text Colors (Hex)
  root.style.setProperty("--text-primary", config.textPrimary);
  root.style.setProperty("--text-secondary", config.textSecondary);
  root.style.setProperty("--text-muted", config.textMuted);
  root.style.setProperty("--text-accent", config.textAccent);
  
  // Brand Colors (Hex)
  root.style.setProperty("--clube-blue", config.clubeBlue);
  root.style.setProperty("--clube-yellow", config.clubeYellow);
  root.style.setProperty("--clube-red", config.clubeRed);

  // Admin Variables
  root.style.setProperty("--admin-blue", config.adminBlue || "#002e5d");
  root.style.setProperty("--admin-yellow", config.adminYellow || "#ffed32");
}
