-- SCRIPT FINAL COM EDIÇÃO (v14)

-- 1. Garante pgcrypto
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA extensions;

-- 2. Registro por Nome
DROP FUNCTION IF EXISTS public.registrar_usuario_por_nome;
CREATE OR REPLACE FUNCTION public.registrar_usuario_por_nome(
  p_username TEXT,
  p_password TEXT,
  p_display_name TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public, extensions
AS $$
DECLARE
  new_uid UUID := gen_random_uuid();
  internal_email TEXT;
  hashed_password TEXT;
BEGIN
  internal_email := LOWER(TRIM(p_username)) || '@radio.internal';
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = internal_email) THEN
    RAISE EXCEPTION 'USUARIO_EXISTENTE';
  END IF;

  hashed_password := extensions.crypt(p_password, extensions.gen_salt('bf'));

  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
    confirmation_token, recovery_token, email_change_token_new, email_change
  )
  VALUES (
    new_uid, '00000000-0000-0000-0000-000000000000', internal_email, 
    hashed_password, now(), '{"provider":"email","providers":["email"]}'::jsonb,
    p_metadata || jsonb_build_object('username', p_username, 'display_name', p_display_name),
    now(), now(), 'authenticated', 'authenticated',
    '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  )
  VALUES (
    gen_random_uuid(), new_uid, 
    jsonb_build_object('sub', new_uid::text, 'email', internal_email, 'email_verified', true), 
    'email', new_uid::text, now(), now(), now()
  );

  INSERT INTO public.user_permissions (
    user_id, username, display_name, permissions
  ) VALUES (
    new_uid, p_username, p_display_name, 
    ARRAY(SELECT jsonb_array_elements_text(COALESCE(NULLIF(p_metadata->'permissions', 'null'::jsonb), '["base"]'::jsonb)))
  );

  RETURN new_uid;
END;
$$;

-- 3. Atualização de Usuário (v14 - NEW)
DROP FUNCTION IF EXISTS public.atualizar_usuario;
CREATE OR REPLACE FUNCTION public.atualizar_usuario(
  p_user_id UUID,
  p_display_name TEXT DEFAULT NULL,
  p_password TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public, extensions
AS $$
BEGIN
  UPDATE auth.users
  SET 
    raw_user_meta_data = raw_user_meta_data || 
                         CASE WHEN p_display_name IS NOT NULL THEN jsonb_build_object('display_name', p_display_name) ELSE '{}'::jsonb END ||
                         p_metadata,
    updated_at = now()
  WHERE id = p_user_id;

  IF p_password IS NOT NULL AND p_password <> '' THEN
    UPDATE auth.users
    SET encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf'))
    WHERE id = p_user_id;
  END IF;

  UPDATE public.user_permissions
  SET
    display_name = COALESCE(p_display_name, display_name),
    permissions = CASE WHEN p_metadata ? 'permissions' THEN ARRAY(SELECT jsonb_array_elements_text(p_metadata->'permissions')) ELSE permissions END
  WHERE user_id = p_user_id;
END;
$$;

-- 4. Deleção
DROP FUNCTION IF EXISTS public.deletar_usuario;
CREATE OR REPLACE FUNCTION public.deletar_usuario(target_uid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = target_uid;
  DELETE FROM public.user_permissions WHERE user_id = target_uid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.registrar_usuario_por_nome TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.atualizar_usuario TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.deletar_usuario TO authenticated, anon;

-- 5. Sincronizar usuários órfãos (que já existem no sistema mas não aparecem no painel)
-- Rode esta parte caso algum usuário tenha sido criado antes da correção de segurança.
INSERT INTO public.user_permissions (user_id, username, display_name, permissions)
SELECT 
  id as user_id,
  COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)) as username,
  COALESCE(raw_user_meta_data->>'display_name', split_part(email, '@', 1)) as display_name,
  CASE 
    WHEN raw_user_meta_data ? 'permissions' THEN ARRAY(SELECT jsonb_array_elements_text(raw_user_meta_data->'permissions'))
    ELSE ARRAY['base']::text[]
  END as permissions
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_permissions);

-- 6. Corrigir as permissões de visualização (RLS) para exibir todos no painel
DO $$
BEGIN
  -- Tentar derrubar políticas antigas que podiam estar bloqueando a visão
  DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_permissions;
  DROP POLICY IF EXISTS "Users can view their own permissions" ON public.user_permissions;
  DROP POLICY IF EXISTS "Allow authenticated users to read permissions" ON public.user_permissions;
  DROP POLICY IF EXISTS "Admins and user managers can view all" ON public.user_permissions;
EXCEPTION WHEN OTHERS THEN
  -- Ignora se der erro
END $$;

ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura da lista de usuarios para logados" ON public.user_permissions;
CREATE POLICY "Permitir leitura da lista de usuarios para logados" 
ON public.user_permissions FOR SELECT 
TO authenticated 
USING (true);


-- 7. Consertar usuários criados recentemente para permitir fazer LOGIN
-- O banco do Supabase se recusa a fazer login ("Database error querying schema")
-- se as colunas de tokens ou senhas recém-criadas em auth.users estiverem como NULL.
UPDATE auth.users
SET 
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, '')
WHERE 
  confirmation_token IS NULL OR 
  recovery_token IS NULL OR 
  email_change_token_new IS NULL OR 
  email_change IS NULL;

-- 8. Corrigir permissão de gravação da tabela site_config (Aparência/Streaming)
-- Sem isso, o painel de Aparência não consegue salvar as alterações no banco.
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Todos podem ler configurações do site" ON public.site_config;
CREATE POLICY "Todos podem ler configurações do site" 
ON public.site_config FOR SELECT 
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Colaboradores podem salvar configurações" ON public.site_config;
CREATE POLICY "Colaboradores podem salvar configurações" 
ON public.site_config FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);


