export interface Sponsor {
  id: string;
  nome: string;
  logo: string;
  url?: string;
}

export interface Promo {
  id: string;
  titulo: string;
  imagem: string;
  link?: string;
  ativa: boolean;
}

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
  textTitle: string;
  textContent: string;
  textDetail: string;
  // Branding
  logo?: string;
  radioName?: string;
  favicon?: string;
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
  headerGradStart?: string;
  headerGradEnd?: string;
  headerGradient?: string;
  headerTextColor?: string;
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
  showProgramas: boolean;
  showLocutores: boolean;
  showSlides: boolean;
  showPedidos: boolean;
  showPromos: boolean;
  showSponsors: boolean;
  showBackToTop: boolean;
  showEntretenimento: boolean;
  showSocial: boolean;
  showMaintenance: boolean;
  maintenanceMessage: string;
  // Weather settings
  weatherCity: string;
  // Sponsor settings
  sponsorsPosition: 'left' | 'center' | 'right';
  topSongsAlignment: 'left' | 'center' | 'right';
  weatherPosition: 'left' | 'center' | 'right';
  // Dynamic Content
  sponsors?: Sponsor[];
  promos?: Promo[];
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
  adminText: string;
  adminSidebarText: string;
  adminContentTitle: string;
  adminCardText: string;
  adminHeaderGradStart: string;
  adminHeaderGradEnd: string;
  adminLogo?: string;
  logoCircleColor1?: string;
  logoCircleColor2?: string;
  // Navigation Granular Colors
  navItemColor?: string;
  navItemHoverColor?: string;
  navItemActiveColor?: string;
  navItemActiveTextColor?: string;
  // Live Player Granular Colors
  playerLiveBg?: string;
  playerLiveText?: string;
  playerLiveBorderColor?: string;
  playerLiveBorderSize?: string;
  showPlayerLiveBorder?: boolean;
  // News / Plantão Colors
  plantaoTitleColor?: string;
  plantaoSubtitleColor?: string;
  plantaoLineColor?: string;
  plantaoCardBg?: string;
  plantaoCardTextColor?: string;
  // Highlights / Global Buttons
  highlightBtnBg?: string;
  highlightBtnText?: string;
  highlightBtnHoverBg?: string;
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
  textMuted: "#64748b",
  textAccent: "#ff8c00",
  textTitle: "#002e5d",
  textContent: "#475569",
  textDetail: "#ff8c00",
  radioFreq: "87.9",
  radioName: "IMPACTO",
  logo: "",
  favicon: "",
  playerOpenUrl: "/player",
  clubeBlue: "#002e5d",
  clubeYellow: "#ffed32",
  clubeRed: "#ff8c00",
  headerGradStart: "#002e5d",
  headerGradEnd: "#001a35",
  headerTextColor: "#ffffff",
  topSongsPosition: 'hero',
  pedidoPosition: 'center',
  playerPosition: 'center',
  showTopSongs: true,
  showGallery: true,
  showNews: true,
  showAbout: true,
  showWeather: true,
  showProgramas: true,
  showLocutores: true,
  showSlides: true,
  showPedidos: true,
  showPromos: true,
  showSponsors: true,
  showBackToTop: true,
  showEntretenimento: true,
  showSocial: true,
  showMaintenance: false,
  maintenanceMessage: "Estamos realizando manutenções em nosso portal para melhor atendê-los. Voltaremos em breve com muitas novidades!",
  weatherCity: 'Brasília',
  sponsorsPosition: 'center',
  topSongsAlignment: 'center',
  weatherPosition: 'left',
  sponsors: [],
  promos: [],
  navMenus: [
    { label: "AO VIVO", href: "/" },
    { label: "PROMOÇÕES", href: "#promocoes" },
    { label: "ENTRETENIMENTO", href: "#entretenimento" },
    { label: "MÚSICA", href: "#musica" },
    { label: "PROGRAMAÇÃO", href: "/programacao" },
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
  adminText: "#ffffff",
  adminSidebarText: "rgba(255,255,255,0.8)",
  adminContentTitle: "#002e5d",
  adminCardText: "#18181b",
  adminHeaderGradStart: "#ffffff",
  adminHeaderGradEnd: "#f1f5f9",
  logoCircleColor1: "#ffed32",
  logoCircleColor2: "#ff8c00",
  // New Granular Defaults
  navItemColor: "#ffffff",
  navItemHoverColor: "#ffed32",
  navItemActiveColor: "#ffed32",
  navItemActiveTextColor: "#002e5d",
  playerLiveBg: "#ff8c00",
  playerLiveText: "#ffffff",
  playerLiveBorderColor: "#ffffff",
  playerLiveBorderSize: "8px",
  showPlayerLiveBorder: true,
  plantaoTitleColor: "#002e5d",
  plantaoSubtitleColor: "#002e5d",
  plantaoLineColor: "#002e5d",
  plantaoCardBg: "#ffffff",
  plantaoCardTextColor: "#18181b",
  highlightBtnBg: "#ffed32",
  highlightBtnText: "#002e5d",
  highlightBtnHoverBg: "#ffdb00",
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
  root.style.setProperty("--text-title", config.textTitle || config.textPrimary);
  root.style.setProperty("--text-content", config.textContent || "#475569");
  root.style.setProperty("--text-detail", config.textDetail || config.textAccent);
  
  // Brand Colors (Hex)
  root.style.setProperty("--clube-blue", config.clubeBlue);
  root.style.setProperty("--clube-yellow", config.clubeYellow);
  root.style.setProperty("--clube-red", config.clubeRed);
  root.style.setProperty("--header-grad-start", config.headerGradStart || "#002e5d");
  root.style.setProperty("--header-grad-end", config.headerGradEnd || "#001a35");
  root.style.setProperty("--header-text-color", config.headerTextColor || "#ffffff");

  // Admin Variables
  root.style.setProperty("--admin-blue", config.adminBlue || "#002e5d");
  root.style.setProperty("--admin-yellow", config.adminYellow || "#ffed32");
  root.style.setProperty("--admin-text", config.adminText || "#ffffff");
  root.style.setProperty("--admin-sidebar-text", config.adminSidebarText || "rgba(255,255,255,0.6)");
  root.style.setProperty("--admin-content-title", config.adminContentTitle || "#002e5d");
  root.style.setProperty("--admin-card-text", config.adminCardText || "#475569");
  root.style.setProperty("--admin-header-grad-start", config.adminHeaderGradStart || "#ffffff");
  root.style.setProperty("--admin-header-grad-end", config.adminHeaderGradEnd || "#f8fafc");
  root.style.setProperty("--logo-circle-1", config.logoCircleColor1 || "#ffed32");
  root.style.setProperty("--logo-circle-2", config.logoCircleColor2 || "#ec2027");

  // New Granular Variables
  root.style.setProperty("--nav-item-color", config.navItemColor || config.headerTextColor || "#ffffff");
  root.style.setProperty("--nav-item-hover", config.navItemHoverColor || config.textSecondary || "#ffed32");
  root.style.setProperty("--nav-item-active", config.navItemActiveColor || config.textSecondary || "#ffed32");
  root.style.setProperty("--nav-item-active-text", config.navItemActiveTextColor || config.clubeBlue || "#002e5d");
  
  root.style.setProperty("--player-live-bg", config.playerLiveBg || config.clubeRed || "#ff8c00");
  root.style.setProperty("--player-live-text", config.playerLiveText || "#ffffff");
  root.style.setProperty("--player-live-border", config.playerLiveBorderColor || "#ffffff");
  root.style.setProperty("--player-live-border-size", config.showPlayerLiveBorder ? (config.playerLiveBorderSize || "8px") : "0px");
  
  root.style.setProperty("--plantao-title", config.plantaoTitleColor || config.clubeBlue || "#002e5d");
  root.style.setProperty("--plantao-subtitle", config.plantaoSubtitleColor || config.clubeBlue || "#002e5d");
  root.style.setProperty("--plantao-line", config.plantaoLineColor || config.clubeBlue || "#002e5d");
  root.style.setProperty("--plantao-card-bg", config.plantaoCardBg || "#ffffff");
  root.style.setProperty("--plantao-card-text", config.plantaoCardTextColor || "#18181b");
  
  root.style.setProperty("--highlight-btn-bg", config.highlightBtnBg || config.clubeYellow || "#ffed32");
  root.style.setProperty("--highlight-btn-text", config.highlightBtnText || config.clubeBlue || "#002e5d");
  root.style.setProperty("--highlight-btn-hover", config.highlightBtnHoverBg || "#ffdb00");
}
