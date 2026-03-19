-- SCRIPT: FIX PARA RECURSÃO INFINITA (v7)

-- 1. Remove políticas que geram loop infinito
DROP POLICY IF EXISTS "Admins can view roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins view roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage perms" ON public.user_permissions;
DROP POLICY IF EXISTS "Admins total" ON public.user_permissions;

-- 2. Garante tabelas limpas
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions DISABLE ROW LEVEL SECURITY;

-- 3. Re-habilita com políticas simples (Sem recursão)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública para autenticados" 
ON public.user_roles FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Gestão total de permissões" 
ON public.user_permissions FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- 4. Função RPC revisada (v7 - Login por Nome)
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
BEGIN
  internal_email := LOWER(TRIM(p_username)) || '@radio.internal';

  IF EXISTS (SELECT 1 FROM auth.users WHERE email = internal_email) THEN
    RAISE EXCEPTION 'USUARIO_EXISTENTE';
  END IF;

  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    role, aud
  )
  VALUES (
    new_uid, '00000000-0000-0000-0000-000000000000',
    internal_email, 
    extensions.crypt(p_password, extensions.gen_salt('bf')), 
    now(), '{"provider":"email","providers":["email"]}'::jsonb, 
    p_metadata || jsonb_build_object('username', p_username, 'display_name', p_display_name), 
    now(), now(), 'authenticated', 'authenticated'
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  )
  VALUES (
    gen_random_uuid(), new_uid, 
    jsonb_build_object('sub', new_uid::text, 'email', internal_email), 
    'email', now(), now(), now()
  );

  RETURN new_uid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.registrar_usuario_por_nome TO authenticated, anon;
