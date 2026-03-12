import { supabase } from "@/integrations/supabase/client";

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

const CATEGORIAS_KEY = "radio_noticias_categorias";
const DEFAULT_CATEGORIAS = ["Local", "Regional"];

export async function getNoticias(): Promise<Noticia[]> {
  const { data, error } = await supabase
    .from("noticias")
    .select("*")
    .order("data_postagem", { ascending: false });
  
  if (error) { console.error("Erro ao buscar noticias:", error); return []; }
  
  return (data || []).map(n => ({
    id: n.id,
    titulo: n.titulo,
    resumo: n.resumo || "",
    conteudo: n.conteudo || "",
    categoria: n.categoria || "Geral",
    data: n.data_postagem,
    imagem: n.imagem || undefined,
    fonte: n.fonte || undefined,
    url: n.url || undefined
  }));
}

export async function saveNoticia(n: Partial<Noticia>) {
  const dbData = {
    titulo: n.titulo,
    resumo: n.resumo,
    conteudo: n.conteudo,
    categoria: n.categoria,
    imagem: n.imagem,
    fonte: n.fonte,
    url: n.url,
  };

  if (n.id) {
    return await supabase.from("noticias").update(dbData).eq("id", n.id);
  } else {
    return await supabase.from("noticias").insert(dbData);
  }
}

export async function deleteNoticia(id: string) {
  return await supabase.from("noticias").delete().eq("id", id);
}

export async function getCategorias(): Promise<string[]> {
  const { data, error } = await supabase.from("site_config").select("value").eq("key", "noticias_categorias").single();
  if (error || !data) return [...DEFAULT_CATEGORIAS];
  return data.value as string[];
}

export async function saveCategorias(data: string[]) {
  return await supabase.from("site_config").upsert({ key: "noticias_categorias", value: data });
}
