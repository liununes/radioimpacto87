-- SCRIPT DE REPARO DEFINITIVO (v4)
-- Nomes padronizados para o cache do frontend: p_email, p_password, p_metadata

-- 1. Limpeza Total de Versões Antigas
DROP FUNCTION IF EXISTS public.registrar_usuario_sem_confirmar(text,text,jsonb);
DROP FUNCTION IF EXISTS public.registrar_usuario_sem_confirmar(text,jsonb,text);
DROP FUNCTION IF EXISTS public.registrar_usuario_sem_confirmar;

-- 2. Tabela de Permissões
CREATE TABLE IF NOT EXISTS public.user_permissions (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    permissions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins total" ON public.user_permissions;
CREATE POLICY "Admins total" ON public.user_permissions FOR ALL TO authenticated USING (true);

-- 3. Nova Função RPC (Nomes padronizados p_)
CREATE OR REPLACE FUNCTION public.registrar_usuario_sem_confirmar(
  p_email TEXT,
  p_password TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
DECLARE
  new_uid UUID := gen_random_uuid();
BEGIN
  -- Verifica duplicado
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    RAISE EXCEPTION 'O e-mail % já está cadastrado.', p_email;
  END IF;

  -- 1. Insere em auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    role, aud
  )
  VALUES (
    new_uid, '00000000-0000-0000-0000-000000000000',
    p_email, crypt(p_password, gen_salt('bf')), 
    now(), '{"provider":"email","providers":["email"]}'::jsonb, 
    p_metadata, now(), now(), 'authenticated', 'authenticated'
  );

  -- 2. Insere em auth.identities
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  )
  VALUES (
    gen_random_uuid(), new_uid, 
    jsonb_build_object('sub', new_uid::text, 'email', p_email), 
    'email', now(), now(), now()
  );

  RETURN new_uid;
END;
$$;

-- 4. Função de Deleção
DROP FUNCTION IF EXISTS public.deletar_usuario(uuid);
CREATE OR REPLACE FUNCTION public.deletar_usuario(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;

-- 5. Permissões de Execução Ampliadas
GRANT EXECUTE ON FUNCTION public.registrar_usuario_sem_confirmar TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.deletar_usuario TO authenticated, service_role;

-- 6. Força Notificação de sucesso no Log do SQL Editor
SELECT 'Função registrar_usuario_sem_confirmar criada com sucesso!' as status;
