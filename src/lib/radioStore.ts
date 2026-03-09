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
  horaInicio: string; // HH:MM
  horaFim: string;    // HH:MM
  diasSemana: number[]; // 0=Dom, 1=Seg...6=Sab
}

const LOCUTORES_KEY = "radio_locutores";
const PROGRAMAS_KEY = "radio_programas";

export function getLocutores(): Locutor[] {
  try {
    return JSON.parse(localStorage.getItem(LOCUTORES_KEY) || "[]");
  } catch { return []; }
}

export function saveLocutores(data: Locutor[]) {
  localStorage.setItem(LOCUTORES_KEY, JSON.stringify(data));
}

export function getProgramas(): Programa[] {
  try {
    return JSON.parse(localStorage.getItem(PROGRAMAS_KEY) || "[]");
  } catch { return []; }
}

export function saveProgramas(data: Programa[]) {
  localStorage.setItem(PROGRAMAS_KEY, JSON.stringify(data));
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
