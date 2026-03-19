-- SCRIPT: SISTEMA DE LOGIN POR NOME (v5)
-- Habilita login por 'username' além de e-mail.

-- 1. Extensões
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabela de Permissões Atualizada
ALTER TABLE public.user_permissions ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE public.user_permissions ADD COLUMN IF NOT EXISTS display_name TEXT;

CREATE TABLE IF NOT EXISTS public.user_permissions (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    display_name TEXT,
    email TEXT,
    permissions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage perms" ON public.user_permissions;
CREATE POLICY "Admins manage perms" ON public.user_permissions FOR ALL TO authenticated USING (true);

-- 3. Função RPC de Registro por Nome (Bypass E-mail)
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
SET search_path = auth, public
AS $$
DECLARE
  new_uid UUID := gen_random_uuid();
  internal_email TEXT;
BEGIN
  -- Gera um e-mail interno invisível (ex: lucio@radio.internal)
  internal_email := LOWER(TRIM(p_username)) || '@radio.internal';

  -- Evita nomes repetidos em auth.users
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = internal_email) THEN
    RAISE EXCEPTION 'Este nome de usuário já está em uso.';
  END IF;

  -- 1. Cria em auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    role, aud
  )
  VALUES (
    new_uid, '00000000-0000-0000-0000-000000000000',
    internal_email, crypt(p_password, gen_salt('bf')), 
    now(), '{"provider":"email","providers":["email"]}'::jsonb, 
    p_metadata || jsonb_build_object('username', p_username, 'display_name', p_display_name), 
    now(), now(), 'authenticated', 'authenticated'
  );

  -- 2. Cria identidade
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

-- 4. Função de Deleção
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
GRANT EXECUTE ON FUNCTION public.deletar_usuario TO authenticated;
