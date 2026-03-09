export interface Noticia {
  id: string;
  titulo: string;
  resumo: string;
  conteudo: string;
  categoria: "local" | "regional";
  data: string;
  imagem?: string;
}

const STORAGE_KEY = "radio_noticias";

export function getNoticias(): Noticia[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

export function saveNoticias(data: Noticia[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
