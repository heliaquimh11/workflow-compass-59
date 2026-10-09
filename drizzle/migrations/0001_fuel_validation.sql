ALTER TABLE public.fuel_logs ADD CONSTRAINT fuel_plate_valid CHECK (license_plate ~ '^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$');
ALTER TABLE public.fuel_logs ADD CONSTRAINT fuel_minimum_photos CHECK (cardinality(photo_urls) >= 3);
REVOKE UPDATE ON public.fuel_requests FROM authenticated;
GRANT UPDATE (status) ON public.fuel_requests TO authenticated;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fuel_requests;