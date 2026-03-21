-- SCRIPT DE REPARO DE PERMISSÕES (v15)
-- Este script corrige os problemas de não conseguir adicionar, remover ou editar itens no painel administrativo.

-- 1. NOTÍCIAS
ALTER TABLE public.noticias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos podem ver noticias" ON public.noticias;
CREATE POLICY "Todos podem ver noticias" 
ON public.noticias FOR SELECT 
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Colaboradores podem gerenciar noticias" ON public.noticias;
CREATE POLICY "Colaboradores podem gerenciar noticias" 
ON public.noticias FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);


-- 2. LOCUTORES
ALTER TABLE public.locutores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos podem ver locutores" ON public.locutores;
CREATE POLICY "Todos podem ver locutores" 
ON public.locutores FOR SELECT 
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Colaboradores podem gerenciar locutores" ON public.locutores;
CREATE POLICY "Colaboradores podem gerenciar locutores" 
ON public.locutores FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);


-- 3. PROGRAMAÇÃO (PROGRAMAS)
ALTER TABLE public.programas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos podem ver programas" ON public.programas;
CREATE POLICY "Todos podem ver programas" 
ON public.programas FOR SELECT 
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Colaboradores podem gerenciar programas" ON public.programas;
CREATE POLICY "Colaboradores podem gerenciar programas" 
ON public.programas FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);


-- 4. REDES SOCIAIS
ALTER TABLE public.redes_sociais ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos podem ver redes sociais" ON public.redes_sociais;
CREATE POLICY "Todos podem ver redes sociais" 
ON public.redes_sociais FOR SELECT 
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Colaboradores podem gerenciar redes sociais" ON public.redes_sociais;
CREATE POLICY "Colaboradores podem gerenciar redes sociais" 
ON public.redes_sociais FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);


-- 5. SLIDES
ALTER TABLE public.slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos podem ver slides" ON public.slides;
CREATE POLICY "Todos podem ver slides" 
ON public.slides FOR SELECT 
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Colaboradores podem gerenciar slides" ON public.slides;
CREATE POLICY "Colaboradores podem gerenciar slides" 
ON public.slides FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);


-- 6. GALERIA DE FOTOS (FOTOS)
ALTER TABLE public.fotos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos podem ver fotos" ON public.fotos;
CREATE POLICY "Todos podem ver fotos" 
ON public.fotos FOR SELECT 
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Colaboradores podem gerenciar fotos" ON public.fotos;
CREATE POLICY "Colaboradores podem gerenciar fotos" 
ON public.fotos FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);


-- 7. PEDIDOS DE MÚSICA (PEDIDOS)
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos podem ver pedidos" ON public.pedidos;
CREATE POLICY "Todos podem ver pedidos" 
ON public.pedidos FOR SELECT 
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Visitantes podem fazer pedidos" ON public.pedidos;
CREATE POLICY "Visitantes podem fazer pedidos" 
ON public.pedidos FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Colaboradores podem gerenciar pedidos" ON public.pedidos;
CREATE POLICY "Colaboradores podem gerenciar pedidos" 
ON public.pedidos FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- 8. CATEGORIAS DE NOTÍCIAS (site_config)
-- Garantir que as categorias de notícias possam ser salvas
-- (Isso já deve estar coberto pelo v14, mas vamos garantir)
DROP POLICY IF EXISTS "Colaboradores podem salvar configurações" ON public.site_config;
CREATE POLICY "Colaboradores podem salvar configurações" 
ON public.site_config FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);
