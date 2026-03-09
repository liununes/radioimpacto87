export interface Noticia {
  id: string;
  titulo: string;
  resumo: string;
  conteudo: string;
  categoria: string;
  data: string;
  imagem?: string;
  fonte?: string;
  url?: string;
}

const STORAGE_KEY = "radio_noticias";
const CATEGORIAS_KEY = "radio_noticias_categorias";

const DEFAULT_CATEGORIAS = ["Local", "Regional"];

export function getNoticias(): Noticia[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

export function saveNoticias(data: Noticia[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getCategorias(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(CATEGORIAS_KEY) || "null");
    return saved || [...DEFAULT_CATEGORIAS];
  } catch { return [...DEFAULT_CATEGORIAS]; }
}

export function saveCategorias(data: string[]) {
  localStorage.setItem(CATEGORIAS_KEY, JSON.stringify(data));
}
