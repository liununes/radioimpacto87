-- SCRIPT: SEGURANÇA TOTAL E FIM DE RECURSÃO (v8)

-- 1. Remoção de políticas antigas e inseguras
DROP POLICY IF EXISTS "Acesso total as permissoes" ON public.user_permissions;
DROP POLICY IF EXISTS "Gestão total de permissões" ON public.user_permissions;
DROP POLICY IF EXISTS "Admins can manage user_permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Leitura pública para autenticados" ON public.user_roles;

-- 2. Função de Verificação Protegida (SECURITY DEFINER)
-- Bypass de RLS para evitar recursão infinita e garantir segurança real
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$;

-- 3. Regras para Permissões (Público p/ Ler, Admin p/ Editar)
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura segura" 
ON public.user_permissions FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Gestão segura por admin" 
ON public.user_permissions FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 4. Regras para Cargos (Livre p/ Ler Próprio, Admin p/ Tudo)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver próprio cargo" 
ON public.user_roles FOR SELECT 
TO authenticated 
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admin gerencia cargos" 
ON public.user_roles FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 5. Função de Registro atualizada (Usa raw_app_meta_data para segurança extra)
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
    now(), 
    '{"provider":"email","providers":["email"]}'::jsonb, -- app_metadata (seguro)
    p_metadata || jsonb_build_object('username', p_username, 'display_name', p_display_name), -- user_metadata (exibição)
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
