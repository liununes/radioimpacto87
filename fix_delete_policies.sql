-- Execute este script no SQL Editor do seu dashboard do Supabase
-- Isso habilitará o direito de DELETAR registros nas tabelas da rádio para usuários logados no painel.

-- Programação e Locutores
CREATE POLICY "Permitir deletar programas" ON public.programas FOR DELETE TO authenticated USING (true);
CREATE POLICY "Permitir deletar locutores" ON public.locutores FOR DELETE TO authenticated USING (true);

-- Conteúdo Web (Notícias, Fotos, Slides, Redes)
CREATE POLICY "Permitir deletar noticias" ON public.noticias FOR DELETE TO authenticated USING (true);
CREATE POLICY "Permitir deletar fotos" ON public.fotos FOR DELETE TO authenticated USING (true);
CREATE POLICY "Permitir deletar slides" ON public.slides FOR DELETE TO authenticated USING (true);
CREATE POLICY "Permitir deletar redes_sociais" ON public.redes_sociais FOR DELETE TO authenticated USING (true);
