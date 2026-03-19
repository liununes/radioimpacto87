-- SCRIPT DE REPARO PARA SISTEMA DE USUÁRIOS
-- Este script habilita a criação de usuários sem confirmação de e-mail (Bypass SMTP)
-- E configura as tabelas de permissões necessárias.

-- 1. Habilita extensões necessárias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabela de Permissões (Caso não exista)
CREATE TABLE IF NOT EXISTS public.user_permissions (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    permissions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilita RLS na user_permissions
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- 3. Função para Registrar Usuário sem Confirmação (Security Definer para bypass)
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
  new_user_id UUID;
BEGIN
  -- Cria o usuário em auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    is_super_admin
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    p_metadata,
    now(),
    now(),
    '',
    '',
    now(),
    now(),
    false
  )
  RETURNING id INTO new_user_id;

  -- Adiciona a identidade
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
    format('{"sub":"%s","email":"%s"}', new_user_id::text, p_email)::jsonb,
    'email',
    now(),
    now(),
    now()
  );

  RETURN new_user_id;
END;
$$;

-- 4. Função para Deletar Usuário (Limpa tudo)
CREATE OR REPLACE FUNCTION public.deletar_usuario(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = p_user_id;
  DELETE FROM public.user_permissions WHERE user_id = p_user_id;
  DELETE FROM public.user_roles WHERE user_id = p_user_id;
END;
$$;

-- 5. Políticas de Segurança (RLS)
-- Garante que o Admin Master/Admin pode gerenciar outros
DROP POLICY IF EXISTS "Admins can manage user_permissions" ON public.user_permissions;
CREATE POLICY "Admins can manage user_permissions"
    ON public.user_permissions
    FOR ALL
    TO authenticated
    USING (
      EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
      OR (SELECT (raw_user_meta_data->>'is_master')::boolean FROM auth.users WHERE id = auth.uid())
    );

-- 6. Grant Permissions
GRANT EXECUTE ON FUNCTION public.registrar_usuario_sem_confirmar TO authenticated;
GRANT EXECUTE ON FUNCTION public.deletar_usuario TO authenticated;

-- 7. Criar tabela user_roles se não existir (para o Admin)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view roles" ON public.user_roles;
CREATE POLICY "Admins can view roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
