ALTER TABLE public.fuel_logs ADD COLUMN is_legacy boolean NOT NULL DEFAULT false;
ALTER TABLE public.fuel_logs ADD COLUMN import_key text;
ALTER TABLE public.fuel_logs ADD COLUMN source_file text;
ALTER TABLE public.fuel_logs DROP CONSTRAINT fuel_minimum_photos;
ALTER TABLE public.fuel_logs ADD CONSTRAINT fuel_minimum_photos CHECK (is_legacy OR cardinality(photo_urls) >= 3);
CREATE UNIQUE INDEX fuel_logs_import_unique ON public.fuel_logs (user_id, import_key) WHERE import_key IS NOT NULL;
REVOKE INSERT ON public.fuel_logs FROM authenticated;
GRANT INSERT (id, created_at, user_id, license_plate, odometer, liters, fuel_date_time, tank_location, photo_urls, is_test) ON public.fuel_logs TO authenticated;
CREATE FUNCTION public.import_legacy_fuel_logs(records jsonb, filename text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  caller uuid := auth.uid();
  test_mode boolean := COALESCE((auth.jwt()->>'is_anonymous')::boolean, false);
  imported integer;
BEGIN
  IF caller IS NULL THEN RAISE EXCEPTION 'Sessão necessária para importar.'; END IF;
  IF jsonb_typeof(records) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Registros inválidos.'; END IF;
  IF jsonb_array_length(records) < 1 OR jsonb_array_length(records) > 10000 THEN RAISE EXCEPTION 'Importe entre 1 e 10000 registros por arquivo.'; END IF;
  IF filename IS NULL OR length(filename) > 255 THEN RAISE EXCEPTION 'Nome de arquivo inválido.'; END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(records) r WHERE COALESCE(r->>'import_key', '') !~ '^[a-f0-9]{64}:[0-9]+:[0-9]+$' OR r->>'fuel_date_time' IS NULL) THEN RAISE EXCEPTION 'Identificação ou data de registro inválida.'; END IF;
  INSERT INTO public.fuel_logs (user_id, license_plate, odometer, liters, fuel_date_time, tank_location, photo_urls, is_test, is_legacy, import_key, source_file)
  SELECT caller, r->>'license_plate', (r->>'odometer')::numeric, (r->>'liters')::numeric, (r->>'fuel_date_time')::timestamptz, r->>'tank_location', '{}'::text[], test_mode, true, r->>'import_key', filename
  FROM jsonb_array_elements(records) r
  ON CONFLICT (user_id, import_key) WHERE import_key IS NOT NULL DO NOTHING;
  GET DIAGNOSTICS imported = ROW_COUNT;
  RETURN jsonb_build_object('imported', imported, 'duplicates', jsonb_array_length(records) - imported);
END;
$$;
REVOKE ALL ON FUNCTION public.import_legacy_fuel_logs(jsonb, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.import_legacy_fuel_logs(jsonb, text) TO authenticated;
COMMENT ON FUNCTION public.import_legacy_fuel_logs(jsonb, text) IS 'Atomic legacy import. Caller identity and test claim are enforced; no caller-controlled ownership or photo waiver on normal inserts.';