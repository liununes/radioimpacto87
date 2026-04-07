import { supabase } from "@/integrations/supabase/client";

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
  icone: string;
}

export interface Foto {
  id: string;
  descricao: string;
  imagem: string;
}

export interface Slide {
  id: string;
  titulo: string;
  imagem: string;
  link?: string;
}



export async function getLocutores(): Promise<Locutor[]> {
  const { data, error } = await supabase.from("locutores").select("*").order("nome");
  if (error) { console.error("Erro ao buscar locutores:", error); return []; }
  return data || [];
}

export async function saveLocutor(locutor: Partial<Locutor>) {
  if (locutor.id) {
    const result = await supabase.from("locutores").update(locutor).eq("id", locutor.id).select();
    if (!result.error && (!result.data || result.data.length === 0)) return { error: new Error("Falha ao atualizar locutor. Permissão negada ou não encontrado.") };
    return result;
  } else {
    const result = await supabase.from("locutores").insert(locutor as any).select();
    if (!result.error && (!result.data || result.data.length === 0)) return { error: new Error("Falha ao criar locutor.") };
    return result;
  }
}

export async function deleteLocutor(id: string) {
  // First, find programs referencing this locutor and either delete them or null their locutor_id
  await supabase.from("programas").update({ locutor_id: null } as any).eq("locutor_id", id);
  const result = await supabase.from("locutores").delete({ count: "exact" }).eq("id", id);
  if (!result.error && result.count === 0) return { error: new Error("Falha ao remover locutor. Permissão negada.") };
  return result;
}

export async function clearAllStationData() {
  const { error: progError } = await supabase.from("programas").delete().neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all
  const { error: locError } = await supabase.from("locutores").delete().neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all
  return { error: progError || locError };
}

export async function getProgramas(): Promise<Programa[]> {
  const { data, error } = await supabase.from("programas").select("*");
  if (error) { console.error("Erro ao buscar programas:", error); return []; }
  
  return (data || []).map(p => ({
    id: p.id,
    nome: p.nome,
    locutorId: p.locutor_id || "",
    foto: p.foto || "",
    horaInicio: p.hora_inicio,
    horaFim: p.hora_fim,
    diasSemana: p.dias_semana
  }));
}

export async function savePrograma(p: any) {
  const dbData = {
    nome: p.nome,
    locutor_id: p.locutorId,
    foto: p.foto,
    hora_inicio: p.horaInicio,
    hora_fim: p.horaFim,
    dias_semana: p.diasSemana
  };
  
  if (p.id) {
    const result = await supabase.from("programas").update(dbData as any).eq("id", p.id).select();
    if (!result.error && (!result.data || result.data.length === 0)) return { error: new Error("Falha ao atualizar programa.") };
    return result;
  } else {
    const result = await supabase.from("programas").insert(dbData as any).select();
    if (!result.error && (!result.data || result.data.length === 0)) return { error: new Error("Falha ao criar programa.") };
    return result;
  }
}

export async function deletePrograma(id: string) {
  const result = await supabase.from("programas").delete({ count: "exact" }).eq("id", id);
  if (!result.error && result.count === 0) {
    return { error: new Error("Nenhum registro foi removido. Verifique suas permissões ou se o ID existe.") };
  }
  return result;
}

export async function getFotos(): Promise<Foto[]> {
  const { data, error } = await supabase.from("fotos").select("*").order("created_at", { ascending: false });
  if (error) return [];
  return data || [];
}

export async function deleteFoto(id: string) {
  const result = await supabase.from("fotos").delete({ count: "exact" }).eq("id", id);
  if (!result.error && result.count === 0) return { error: new Error("Falha ao remover foto.") };
  return result;
}

export async function getSlides(): Promise<Slide[]> {
  const { data, error } = await supabase.from("slides").select("*").order("created_at", { ascending: false });
  if (error) return [];
  return data || [];
}

export async function saveSlide(slide: Partial<Slide>) {
  if (slide.id) {
    const result = await supabase.from("slides").update(slide as any).eq("id", slide.id).select();
    if (!result.error && (!result.data || result.data.length === 0)) return { error: new Error("Falha ao atualizar slide.") };
    return result;
  } else {
    const result = await supabase.from("slides").insert(slide as any).select();
    if (!result.error && (!result.data || result.data.length === 0)) return { error: new Error("Falha ao criar slide.") };
    return result;
  }
}

export async function deleteSlide(id: string) {
  const result = await supabase.from("slides").delete({ count: "exact" }).eq("id", id);
  if (!result.error && result.count === 0) return { error: new Error("Falha ao remover slide.") };
  return result;
}

export async function saveFoto(foto: Partial<Foto>) {
  if (foto.id) {
    const result = await supabase.from("fotos").update(foto as any).eq("id", foto.id).select();
    if (!result.error && (!result.data || result.data.length === 0)) return { error: new Error("Falha ao atualizar foto.") };
    return result;
  } else {
    const result = await supabase.from("fotos").insert(foto as any).select();
    if (!result.error && (!result.data || result.data.length === 0)) return { error: new Error("Falha ao salvar foto.") };
    return result;
  }
}

export async function getRedesSociais(): Promise<RedeSocial[]> {
  const { data, error } = await supabase.from("redes_sociais").select("*").order("nome");
  if (error) return [];
  return data || [];
}

export async function saveRedeSocial(rede: Partial<RedeSocial>) {
  if (rede.id) {
    const result = await supabase.from("redes_sociais").update(rede).eq("id", rede.id).select();
    if (!result.error && (!result.data || result.data.length === 0)) return { error: new Error("Falha ao atualizar rede social.") };
    return result;
  } else {
    const result = await supabase.from("redes_sociais").insert(rede as any).select();
    if (!result.error && (!result.data || result.data.length === 0)) return { error: new Error("Falha ao criar rede social.") };
    return result;
  }
}

export async function deleteRedeSocial(id: string) {
  const result = await supabase.from("redes_sociais").delete({ count: "exact" }).eq("id", id);
  if (!result.error && result.count === 0) return { error: new Error("Falha ao remover rede social.") };
  return result;
}

export async function getProgramaAtual(): Promise<{ programa: Programa; locutor: Locutor } | null> {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const dia = now.getDay();
  const hora = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");

  const [programas, locutores] = await Promise.all([getProgramas(), getLocutores()]);

  const atual = programas.find(p =>
    p.diasSemana.includes(dia) && hora >= p.horaInicio && hora < p.horaFim
  );

  if (!atual) return null;

  const locutor = locutores.find(l => l.id === atual.locutorId);
  if (!locutor) return null;

  return { programa: atual, locutor };
}

export async function getSiteConfig(key: string): Promise<any> {
  const { data, error } = await supabase.from("site_config").select("value").eq("key", key).maybeSingle();
  if (error) return null;
  return data?.value;
}

export async function saveSiteConfig(key: string, value: any) {
  return await supabase.from("site_config").upsert({ key, value });
}

export async function getWhatsApp(): Promise<string> {
  const data = await getSiteConfig("streaming");
  return data?.whatsapp || "";
}

export async function saveWhatsApp(numero: string) {
  const current = await getSiteConfig("streaming") || {};
  return await saveSiteConfig("streaming", { ...current, whatsapp: numero });
}

export async function cleanupUnusedImages() {
  try {
    const { data: fotos, error: fotosErr } = await supabase.from("fotos").select("id, imagem");
    if (fotosErr) throw fotosErr;

    const [locutores, programas, slides, noticias, redes] = await Promise.all([
      supabase.from("locutores").select("foto"),
      supabase.from("programas").select("foto"),
      supabase.from("slides").select("imagem"),
      supabase.from("noticias").select("imagem"),
      supabase.from("redes_sociais").select("icone")
    ]);

    const usedUrls = new Set<string>();

    locutores.data?.forEach(l => l.foto && usedUrls.add(l.foto));
    programas.data?.forEach(p => p.foto && usedUrls.add(p.foto));
    slides.data?.forEach(s => s.imagem && usedUrls.add(s.imagem));
    noticias.data?.forEach(n => n.imagem && usedUrls.add(n.imagem));
    redes.data?.forEach(r => r.icone && usedUrls.add(r.icone));

    const unusedFotosIds = fotos?.filter(f => !usedUrls.has(f.imagem)).map(f => f.id) || [];

    if (unusedFotosIds.length > 0) {
      const { error: delErr } = await supabase.from("fotos").delete().in("id", unusedFotosIds);
      if (delErr) throw delErr;
    }

    return { error: null, count: unusedFotosIds.length };
  } catch (error: any) {
    console.error("Erro ao limpar cache de imagens:", error);
    return { error, count: 0 };
  }
}
