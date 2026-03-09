export interface Locutor {
  id: string;
  nome: string;
  bio: string;
  foto: string;
}

export interface Programa {
  id: string;
  nome: string;
  locutorId: string;
  foto: string;
  horaInicio: string;
  horaFim: string;
  diasSemana: number[];
}

export interface RedeSocial {
  id: string;
  nome: string;
  url: string;
  icone: string; // "instagram" | "facebook" | "youtube" | "whatsapp" | "twitter" | "tiktok" | "other"
}

export interface Foto {
  id: string;
  descricao: string;
  imagem: string;
}

const LOCUTORES_KEY = "radio_locutores";
const PROGRAMAS_KEY = "radio_programas";
const REDES_KEY = "radio_redes_sociais";
const FOTOS_KEY = "radio_fotos";
const WHATSAPP_KEY = "radio_whatsapp";

export function getLocutores(): Locutor[] {
  try { return JSON.parse(localStorage.getItem(LOCUTORES_KEY) || "[]"); } catch { return []; }
}

export function saveLocutores(data: Locutor[]) {
  localStorage.setItem(LOCUTORES_KEY, JSON.stringify(data));
}

export function getProgramas(): Programa[] {
  try { return JSON.parse(localStorage.getItem(PROGRAMAS_KEY) || "[]"); } catch { return []; }
}

export function saveProgramas(data: Programa[]) {
  localStorage.setItem(PROGRAMAS_KEY, JSON.stringify(data));
}

export function getRedesSociais(): RedeSocial[] {
  try { return JSON.parse(localStorage.getItem(REDES_KEY) || "[]"); } catch { return []; }
}

export function saveRedesSociais(data: RedeSocial[]) {
  localStorage.setItem(REDES_KEY, JSON.stringify(data));
}

export function getWhatsApp(): string {
  return localStorage.getItem(WHATSAPP_KEY) || "";
}

export function saveWhatsApp(numero: string) {
  localStorage.setItem(WHATSAPP_KEY, numero);
}

export function getFotos(): Foto[] {
  try { return JSON.parse(localStorage.getItem(FOTOS_KEY) || "[]"); } catch { return []; }
}

export function saveFotos(data: Foto[]) {
  localStorage.setItem(FOTOS_KEY, JSON.stringify(data));
}

export function getProgramaAtual(): { programa: Programa; locutor: Locutor } | null {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const dia = now.getDay();
  const hora = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");

  const programas = getProgramas();
  const locutores = getLocutores();

  const atual = programas.find(p =>
    p.diasSemana.includes(dia) && hora >= p.horaInicio && hora < p.horaFim
  );

  if (!atual) return null;

  const locutor = locutores.find(l => l.id === atual.locutorId);
  if (!locutor) return null;

  return { programa: atual, locutor };
}
