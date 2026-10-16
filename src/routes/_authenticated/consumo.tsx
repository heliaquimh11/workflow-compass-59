import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, TankToggle, inputCls } from "@/components/Field";
import { PhotoPicker } from "@/components/PhotoPicker";
import { useSession } from "@/lib/auth";
import { PLATE_RE, formatPlate, localInputToISO, nowLocalInput, uploadPhotos } from "@/lib/fuel";

export const Route = createFileRoute("/_authenticated/consumo")({
  head: () => ({
    meta: [
      { title: "Abastecimento de Veículo | Controle de Abastecimento" },
      { name: "description", content: "Registro de consumo de combustível por veículo com evidências fotográficas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:title", content: "Abastecimento de Veículo" },
      { property: "og:description", content: "Registre placa, hodômetro, litragem e fotos." },
    ],
  }),
  component: Consumo,
});

function Consumo() {
  const { session } = useSession();
  const [plate, setPlate] = useState("");
  const [odometer, setOdometer] = useState("");
  const [liters, setLiters] = useState("");
  const [dt, setDt] = useState(nowLocalInput());
  const [tank, setTank] = useState<"Leste" | "Norte" | "">("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    if (!PLATE_RE.test(plate)) { toast.error("Placa inválida. Use o formato ABC1D23."); return; }
    if (!tank) { toast.error("Selecione a origem do tanque."); return; }
    if (Number(liters) <= 0) { toast.error("Litragem deve ser maior que zero."); return; }
    setBusy(true);
    const tId = toast.loading("Enviando fotos…");
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Sessão expirada. Entre novamente.");
      const uid = u.user.id;
      const urls = await uploadPhotos(files, "fuel_logs", uid, (d, t) => toast.loading(`Enviando fotos ${d}/${t}…`, { id: tId }));
      const { error } = await supabase.from("fuel_logs").insert({
        user_id: uid,
        license_plate: plate,
        odometer: Number(odometer),
        liters: Number(liters),
        fuel_date_time: localInputToISO(dt),
        tank_location: tank,
        photo_urls: urls,
      });
      if (error) throw error;
      toast.success("Abastecimento registrado!", { id: tId });
      setPlate(""); setOdometer(""); setLiters(""); setDt(nowLocalInput()); setTank(""); setFiles([]);
    } catch (err) {
      toast.error("Erro: " + (err as Error).message, { id: tId });
    }
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <h1 className="mb-1 text-3xl font-bold uppercase">Abastecimento</h1>
      <p className="mb-6 text-muted-foreground">Registro de consumo do veículo</p>
      <form onSubmit={submit} className="space-y-5">
        <Field label="Placa" htmlFor="plate">
          <Input id="plate" required value={plate} onChange={(e) => setPlate(formatPlate(e.target.value))} placeholder="ABC1D23" className={`${inputCls} font-mono uppercase tracking-widest`} autoCapitalize="characters" />
        </Field>
        <Field label="Hodômetro (km)" htmlFor="odo">
          <Input id="odo" required type="number" inputMode="decimal" min={0} step="any" value={odometer} onChange={(e) => setOdometer(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Litragem (L)" htmlFor="lit">
          <Input id="lit" required type="number" inputMode="decimal" min={0} step="any" value={liters} onChange={(e) => setLiters(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Data e Hora" htmlFor="dt">
          <Input id="dt" required type="datetime-local" value={dt} onChange={(e) => setDt(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Origem do Tanque">
          <TankToggle value={tank} onChange={setTank} />
        </Field>
        <Field label="Fotos (opcional)">
          <PhotoPicker files={files} onChange={setFiles} />
        </Field>
        <Button type="submit" disabled={busy || !session} className="touch-target h-14 w-full text-lg font-bold">
          {busy ? "Enviando…" : "Registrar Abastecimento"}
        </Button>
      </form>
    </div>
  );
}
