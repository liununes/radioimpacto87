-- SCRIPT DE REPARO FINAL (v3)
-- Execute este script INTEGRALMENTE no SQL Editor do Supabase.

-- 1. Extensões
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabela de Permissões
CREATE TABLE IF NOT EXISTS public.user_permissions (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    permissions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage perms" ON public.user_permissions;
CREATE POLICY "Admins manage perms" ON public.user_permissions FOR ALL TO authenticated USING (true);

-- 3. Função de Cadastro (REDEFINIDA)
DROP FUNCTION IF EXISTS public.registrar_usuario_sem_confirmar(text,text,jsonb);
DROP FUNCTION IF EXISTS public.registrar_usuario_sem_confirmar;

CREATE OR REPLACE FUNCTION public.registrar_usuario_sem_confirmar(
  email_input TEXT,
  password_input TEXT,
  metadata_input JSONB DEFAULT '{}'::jsonb
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
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = email_input) THEN
    RAISE EXCEPTION 'USUARIO_EXISTENTE';
  END IF;

  -- Insere Usuario
  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    role, aud, instance_id
  )
  VALUES (
    new_uid, '00000000-0000-0000-0000-000000000000',
    email_input, crypt(password_input, gen_salt('bf')), 
    now(), '{"provider":"email","providers":["email"]}'::jsonb, 
    metadata_input, now(), now(), 'authenticated', 'authenticated'
  );

  -- Insere Identidade
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  )
  VALUES (
    gen_random_uuid(), new_uid, 
    jsonb_build_object('sub', new_uid::text, 'email', email_input), 
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

-- 5. Permissões de Execução
GRANT EXECUTE ON FUNCTION public.registrar_usuario_sem_confirmar TO authenticated;
GRANT EXECUTE ON FUNCTION public.registrar_usuario_sem_confirmar TO anon;
GRANT EXECUTE ON FUNCTION public.deletar_usuario TO authenticated;

-- VERIFICAÇÃO (Opcional: Verifique o log após rodar)
SELECT 'Função criada com sucesso' as status;
