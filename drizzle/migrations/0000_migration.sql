CREATE TABLE public.fuel_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL,
  license_plate TEXT NOT NULL,
  odometer NUMERIC NOT NULL CHECK (odometer >= 0),
  liters NUMERIC NOT NULL CHECK (liters > 0),
  fuel_date_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tank_location TEXT NOT NULL CHECK (tank_location IN ('Leste','Norte')),
  photo_urls TEXT[] NOT NULL
);
CREATE TABLE public.tank_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL,
  tank_name TEXT NOT NULL CHECK (tank_name IN ('Leste','Norte')),
  current_liters NUMERIC NOT NULL CHECK (current_liters >= 0),
  measurement_date_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  photo_urls TEXT[] DEFAULT '{}'
);
CREATE TABLE public.fuel_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL,
  current_tank_level NUMERIC NOT NULL CHECK (current_tank_level >= 0),
  requested_liters NUMERIC NOT NULL CHECK (requested_liters > 0),
  request_date_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_delivery_date_time TIMESTAMPTZ NOT NULL,
  photo_urls TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente','Aprovado','Concluído','Cancelado'))
);

GRANT SELECT, INSERT ON public.fuel_logs, public.tank_levels, public.fuel_requests TO authenticated;
GRANT UPDATE ON public.fuel_requests TO authenticated;
GRANT ALL ON public.fuel_logs, public.tank_levels, public.fuel_requests TO service_role;

ALTER TABLE public.fuel_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tank_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth read logs" ON public.fuel_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "own insert logs" ON public.fuel_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth read tanks" ON public.tank_levels FOR SELECT TO authenticated USING (true);
CREATE POLICY "own insert tanks" ON public.tank_levels FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth read req" ON public.fuel_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "own insert req" ON public.fuel_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth update req" ON public.fuel_requests FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.tank_levels;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fuel_logs;

CREATE POLICY "auth upload fuel attachments" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'fuel-attachments');
CREATE POLICY "auth read fuel attachments" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'fuel-attachments');