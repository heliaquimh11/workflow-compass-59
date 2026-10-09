ALTER TABLE public.fuel_logs DROP CONSTRAINT fuel_logs_tank_location_check;
ALTER TABLE public.fuel_logs ADD CONSTRAINT fuel_logs_tank_location_check CHECK (tank_location IN ('Leste', 'Norte', 'Ipiranga', 'Itaquera'));
ALTER TABLE public.tank_levels DROP CONSTRAINT tank_levels_tank_name_check;
ALTER TABLE public.tank_levels ADD CONSTRAINT tank_levels_tank_name_check CHECK (tank_name IN ('Leste', 'Norte', 'Ipiranga', 'Itaquera'));
COMMENT ON COLUMN public.fuel_logs.tank_location IS 'Fuel source identifier: Leste, Norte, Ipiranga or Itaquera. Distinct bases; no inferred geographic equivalence.';
COMMENT ON COLUMN public.tank_levels.tank_name IS 'Measured tank identifier: Leste, Norte, Ipiranga or Itaquera.';