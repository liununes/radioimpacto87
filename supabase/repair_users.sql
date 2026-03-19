-- SCRIPT v13 - Ajuste de Senha e Compatibilidade Total (v13)

-- 1. Garante pgcrypto
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA extensions;

-- 2. Função de Registro v13 (Geração de Hash explícita)
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

  -- Gera o hash da senha (bcrypt)
  hashed_password := extensions.crypt(p_password, extensions.gen_salt('bf'));

  -- 1. Cria usuário
  INSERT INTO auth.users (
    id, instance_id, email, 
    encrypted_password,
    email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, 
    created_at, updated_at, role, aud
  )
  VALUES (
    new_uid, '00000000-0000-0000-0000-000000000000', internal_email, 
    hashed_password, 
    now(), 
    '{"provider":"email","providers":["email"]}'::jsonb,
    p_metadata || jsonb_build_object('username', p_username, 'display_name', p_display_name),
    now(), now(), 'authenticated', 'authenticated'
  );

  -- 2. Cria identidade
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  )
  VALUES (
    gen_random_uuid(), new_uid, 
    jsonb_build_object('sub', new_uid::text, 'email', internal_email, 'email_verified', true), 
    'email', new_uid::text, now(), now(), now()
  );

  RETURN new_uid;
END;
$$;

-- 3. Função de Deleção
DROP FUNCTION IF EXISTS public.deletar_usuario(uuid);
CREATE OR REPLACE FUNCTION public.deletar_usuario(target_uid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = target_uid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.registrar_usuario_por_nome TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.deletar_usuario TO authenticated, anon;
