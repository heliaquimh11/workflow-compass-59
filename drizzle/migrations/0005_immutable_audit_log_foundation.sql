CREATE TABLE public.audit_logs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 actor_id uuid,
 actor_label text NOT NULL,
 operation text NOT NULL,
 target_table text,
 target_id text,
 reason text,
 before_data jsonb,
 after_data jsonb,
 details jsonb NOT NULL DEFAULT '{}'::jsonb
);
GRANT SELECT, INSERT ON public.audit_logs TO service_role;
REVOKE ALL ON public.audit_logs FROM anon, authenticated;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_service_access ON public.audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE FUNCTION public.prevent_audit_mutation() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN RAISE EXCEPTION 'Auditoria imutável: alteração e exclusão proibidas.'; END; $$;
REVOKE ALL ON FUNCTION public.prevent_audit_mutation() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER audit_immutable_rows BEFORE UPDATE OR DELETE ON public.audit_logs FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_mutation();
CREATE TRIGGER audit_immutable_truncate BEFORE TRUNCATE ON public.audit_logs FOR EACH STATEMENT EXECUTE FUNCTION public.prevent_audit_mutation();