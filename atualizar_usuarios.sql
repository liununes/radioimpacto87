-- ATUALIZE O SISTEMA DE USUARIOS NO SQL EDITOR DO SUPABASE
ALTER TABLE public.user_permissions ADD COLUMN IF NOT EXISTS email_real TEXT;

CREATE OR REPLACE FUNCTION public.registrar_usuario_por_nome(
  p_username TEXT,
  p_password TEXT,
  p_display_name TEXT,
  p_email TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public, extensions
AS $$
DECLARE
  new_uid UUID := gen_random_uuid();
  final_email TEXT;
  hashed_password TEXT;
BEGIN
  final_email := COALESCE(p_email, LOWER(TRIM(p_username)) || '@radio.internal');
  
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = final_email) THEN
    RAISE EXCEPTION 'USUARIO_EXISTENTE';
  END IF;

  hashed_password := extensions.crypt(p_password, extensions.gen_salt('bf'));

  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud,
    confirmation_token, recovery_token, email_change_token_new, email_change
  )
  VALUES (
    new_uid, '00000000-0000-0000-0000-000000000000', final_email, 
    hashed_password, now(), '{"provider":"email","providers":["email"]}'::jsonb,
    p_metadata || jsonb_build_object('username', p_username, 'display_name', p_display_name, 'real_email', p_email),
    now(), now(), 'authenticated', 'authenticated', '', '', '', ''
  );

  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  VALUES (gen_random_uuid(), new_uid, jsonb_build_object('sub', new_uid::text, 'email', final_email, 'email_verified', true), 'email', new_uid::text, now(), now(), now());

  INSERT INTO public.user_permissions (user_id, username, display_name, email_real, permissions)
  VALUES (new_uid, p_username, p_display_name, p_email, ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_metadata->'permissions', '["base"]'::jsonb))));

  RETURN new_uid;
END;
$$;
