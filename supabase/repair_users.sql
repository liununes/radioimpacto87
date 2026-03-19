-- SCRIPT DE REPARO ROBUSTO PARA SISTEMA DE USUÁRIOS (v2)
-- Execute este script no SQL Editor do Supabase se o cadastro não estiver funcionando.

-- 1. Garante que pgcrypto esteja disponível para senhas e UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabela de Permissões (Pode existir, então usamos IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS public.user_permissions (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    permissions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Força a política de segurança correta
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage user_permissions" ON public.user_permissions;
CREATE POLICY "Admins can manage user_permissions"
    ON public.user_permissions
    FOR ALL
    TO authenticated
    USING (
      -- Admin master via metadata ou papel admin via user_roles
      (auth.jwt()->'user_metadata'->>'is_master')::boolean = true
      OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
      OR (SELECT permissions FROM public.user_permissions WHERE user_id = auth.uid()) @> ARRAY['usuarios']
      OR (SELECT permissions FROM public.user_permissions WHERE user_id = auth.uid()) @> ARRAY['*']
    );

-- 3. Função Principal de Cadastro (Bypass SMTP)
DROP FUNCTION IF EXISTS public.registrar_usuario_sem_confirmar;
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
  new_user_id UUID := gen_random_uuid();
BEGIN
  -- Logs para depuração no Supabase Logs (se necessário)
  -- RAISE NOTICE 'Registrando usuário: %', p_email;

  -- 1. Verifica se e-mail já existe para dar erro amigável
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    RAISE EXCEPTION 'O e-mail % já está cadastrado.', p_email;
  END IF;

  -- 2. Insere na tabela de autenticação
  INSERT INTO auth.users (
    id, 
    instance_id, 
    email, 
    encrypted_password, 
    email_confirmed_at, 
    raw_app_meta_data, 
    raw_user_meta_data, 
    created_at, 
    updated_at, 
    role, 
    aud
  )
  VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    p_email,
    crypt(p_password, gen_salt('bf')), -- Encripta a senha
    now(), -- Confirma o e-mail automaticamente
    '{"provider":"email","providers":["email"]}'::jsonb,
    p_metadata,
    now(),
    now(),
    'authenticated',
    'authenticated'
  );

  -- 3. Insere a identidade (obrigatório em versões recentes do Supabase Auth)
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    new_user_id,
    jsonb_build_object('sub', new_user_id::text, 'email', p_email),
    'email',
    now(),
    now(),
    now()
  );

  RETURN new_user_id;
END;
$$;

-- 4. Função de Remoção
DROP FUNCTION IF EXISTS public.deletar_usuario;
CREATE OR REPLACE FUNCTION public.deletar_usuario(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = p_user_id;
  -- CASCADE cuidará das outras tabelas
END;
$$;

-- 5. Dar permissão de execução ao papel autenticado
GRANT EXECUTE ON FUNCTION public.registrar_usuario_sem_confirmar TO authenticated;
GRANT EXECUTE ON FUNCTION public.deletar_usuario TO authenticated;

-- 6. Garantir tabela de roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
    UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view roles" ON public.user_roles;
CREATE POLICY "Admins can view roles" ON public.user_roles FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
