ALTER TABLE public.profiles DROP CONSTRAINT profiles_username_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_check CHECK (username ~ '^[a-z0-9][a-z0-9._-]{2,31}$');
CREATE OR REPLACE FUNCTION public.admin_manage_account(target uuid, action text, new_role public.app_role DEFAULT NULL, confirmed boolean DEFAULT false) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE before_profile jsonb; before_role public.app_role; after_profile jsonb;
BEGIN
 PERFORM pg_advisory_xact_lock(7192301);
 IF NOT public.can_operate() OR NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Acesso exclusivo para administradores ativos.'; END IF;
 SELECT to_jsonb(p) INTO before_profile FROM public.profiles p WHERE id=target FOR UPDATE;
 SELECT role INTO before_role FROM public.user_roles WHERE user_id=target;
 IF before_profile IS NULL THEN RAISE EXCEPTION 'Usuário não encontrado.'; END IF;
 IF action='role' THEN
  IF target=auth.uid() THEN RAISE EXCEPTION 'Não altere a própria classe.'; END IF;
  IF new_role IS NULL OR (new_role='admin' AND NOT confirmed) THEN RAISE EXCEPTION 'Confirmação de administrador obrigatória.'; END IF;
  UPDATE public.user_roles SET role=new_role WHERE user_id=target;
 ELSIF action IN ('activate','deactivate') THEN
  UPDATE public.profiles SET active=(action='activate') WHERE id=target;
 ELSE RAISE EXCEPTION 'Ação inválida.';
 END IF;
 SELECT to_jsonb(p) INTO after_profile FROM public.profiles p WHERE id=target;
 INSERT INTO public.audit_logs(actor_id,actor_label,operation,target_table,target_id,before_data,after_data)
 VALUES(auth.uid(),(SELECT display_name FROM public.profiles WHERE id=auth.uid()),'account_'||action,'profiles',target::text,before_profile||jsonb_build_object('role',before_role),after_profile||jsonb_build_object('role',(SELECT role FROM public.user_roles WHERE user_id=target)));
END; $$;
REVOKE ALL ON FUNCTION public.admin_manage_account(uuid,text,public.app_role,boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_manage_account(uuid,text,public.app_role,boolean) TO authenticated;
CREATE FUNCTION public.admin_finalize_account(actor uuid,target uuid,full_name text,login_name text,account_role public.app_role,confirmed boolean DEFAULT false) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(7192301);
 IF NOT EXISTS(SELECT 1 FROM public.profiles p JOIN public.user_roles r ON r.user_id=p.id WHERE p.id=actor AND p.active AND NOT p.must_change_password AND r.role='admin') THEN RAISE EXCEPTION 'Administrador ativo obrigatório.'; END IF;
 IF account_role='admin' AND NOT confirmed THEN RAISE EXCEPTION 'Confirmação obrigatória.'; END IF;
 INSERT INTO public.profiles(id,display_name,username,must_change_password) VALUES(target,trim(full_name),login_name,false);
 INSERT INTO public.user_roles(user_id,role) VALUES(target,account_role);
 INSERT INTO public.audit_logs(actor_id,actor_label,operation,target_table,target_id,after_data) VALUES(actor,(SELECT display_name FROM public.profiles WHERE id=actor),'account_create','profiles',target::text,jsonb_build_object('display_name',trim(full_name),'username',login_name,'role',account_role,'active',true));
END; $$;
REVOKE ALL ON FUNCTION public.admin_finalize_account(uuid,uuid,text,text,public.app_role,boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_finalize_account(uuid,uuid,text,text,public.app_role,boolean) TO service_role;
CREATE FUNCTION public.admin_audit_password_reset(actor uuid,target uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.profiles p JOIN public.user_roles r ON r.user_id=p.id WHERE p.id=actor AND p.active AND NOT p.must_change_password AND r.role='admin') THEN RAISE EXCEPTION 'Administrador ativo obrigatório.'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=target) THEN RAISE EXCEPTION 'Usuário não encontrado.'; END IF;
 INSERT INTO public.audit_logs(actor_id,actor_label,operation,target_table,target_id,details) VALUES(actor,(SELECT display_name FROM public.profiles WHERE id=actor),'account_password_reset','profiles',target::text,jsonb_build_object('password_changed',true));
END; $$;
REVOKE ALL ON FUNCTION public.admin_audit_password_reset(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.admin_audit_password_reset(uuid,uuid) TO service_role;
CREATE OR REPLACE FUNCTION public.import_legacy_fuel_logs(records jsonb,filename text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE caller uuid:=auth.uid(); imported integer; BEGIN
 IF NOT public.can_operate() OR NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Importação exclusiva para administrador ativo.'; END IF;
 IF jsonb_typeof(records) IS DISTINCT FROM 'array' OR jsonb_array_length(records)<1 OR jsonb_array_length(records)>10000 THEN RAISE EXCEPTION 'Importe entre 1 e 10000 registros.'; END IF;
 IF filename IS NULL OR length(filename)>255 OR EXISTS(SELECT 1 FROM jsonb_array_elements(records) r WHERE COALESCE(r->>'import_key','') !~ '^[a-f0-9]{64}:[0-9]+:[0-9]+$' OR r->>'fuel_date_time' IS NULL) THEN RAISE EXCEPTION 'Importação inválida.'; END IF;
 INSERT INTO public.fuel_logs(user_id,license_plate,odometer,liters,fuel_date_time,tank_location,photo_urls,is_test,is_legacy,import_key,source_file) SELECT caller,r->>'license_plate',(r->>'odometer')::numeric,(r->>'liters')::numeric,(r->>'fuel_date_time')::timestamptz,r->>'tank_location','{}'::text[],public.account_test_default(),true,r->>'import_key',filename FROM jsonb_array_elements(records) r ON CONFLICT(user_id,import_key) WHERE import_key IS NOT NULL DO NOTHING;
 GET DIAGNOSTICS imported=ROW_COUNT; RETURN jsonb_build_object('imported',imported,'duplicates',jsonb_array_length(records)-imported); END; $$;