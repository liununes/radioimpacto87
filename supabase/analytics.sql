-- Rastreamento de Acessos Únicos
CREATE TABLE IF NOT EXISTS public.site_accesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices úteis para acelerar gráficos e relatórios
CREATE INDEX IF NOT EXISTS idx_site_accesses_dt ON public.site_accesses(created_at);
CREATE INDEX IF NOT EXISTS idx_site_accesses_session ON public.site_accesses(session_id);

-- Ativar segurança
ALTER TABLE public.site_accesses ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa que visita o site (anon) pode cadastrar a visualização
DROP POLICY IF EXISTS "Visitantes podem registrar acesso" ON public.site_accesses;
CREATE POLICY "Visitantes podem registrar acesso" 
ON public.site_accesses FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Somente usuários do painel (logados) podem visualizar os dados
DROP POLICY IF EXISTS "Admins podem ler estatisticas" ON public.site_accesses;
CREATE POLICY "Admins podem ler estatisticas" 
ON public.site_accesses FOR SELECT 
TO authenticated 
USING (true);
