import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, TankToggle, inputCls } from "@/components/Field";
import { PhotoPicker } from "@/components/PhotoPicker";
import { useSession } from "@/lib/auth";
import { localInputToISO, nowLocalInput, uploadPhotos } from "@/lib/fuel";

export const Route = createFileRoute("/_authenticated/tanque")({
  head: () => ({
    meta: [
      { title: "Nível do Tanque | Controle de Abastecimento" },
      { name: "description", content: "Atualização do volume disponível nos tanques Leste e Norte." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:title", content: "Nível do Tanque" },
      { property: "og:description", content: "Informe a quantidade de litros nos tanques." },
    ],
  }),
  component: Tanque,
});

function Tanque() {
  const { session } = useSession();
  const [tank, setTank] = useState<"Leste" | "Norte" | "">("");
  const [liters, setLiters] = useState("");
  const [dt, setDt] = useState(nowLocalInput());
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    if (!tank) { toast.error("Selecione o tanque."); return; }
    if (Number(liters) < 0 || liters === "") { toast.error("Informe a quantidade de litros."); return; }
    setBusy(true);
    const tId = toast.loading("Salvando…");
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Sessão expirada. Entre novamente.");
      const uid = u.user.id;
      const urls = files.length
        ? await uploadPhotos(files, "tank_levels", uid, (d, t) => toast.loading(`Enviando fotos ${d}/${t}…`, { id: tId }))
        : [];
      const { error } = await supabase.from("tank_levels").insert({
        user_id: uid,
        tank_name: tank,
        current_liters: Number(liters),
        measurement_date_time: localInputToISO(dt),
        photo_urls: urls,
      });
      if (error) throw error;
      toast.success(`Tanque ${tank} atualizado!`, { id: tId });
      setTank(""); setLiters(""); setDt(nowLocalInput()); setFiles([]);
    } catch (err) {
      toast.error("Erro: " + (err as Error).message, { id: tId });
    }
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <h1 className="mb-1 text-3xl font-bold uppercase">Tanque</h1>
      <p className="mb-6 text-muted-foreground">Medição do nível do tanque</p>
      <form onSubmit={submit} className="space-y-5">
        <Field label="Tanque">
          <TankToggle value={tank} onChange={setTank} />
        </Field>
        <Field label="Quantidade de litros no tanque" htmlFor="lit">
          <Input id="lit" required type="number" inputMode="decimal" min={0} step="any" value={liters} onChange={(e) => setLiters(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Dia e hora" htmlFor="dt">
          <Input id="dt" required type="datetime-local" value={dt} onChange={(e) => setDt(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Fotos">
          <PhotoPicker files={files} onChange={setFiles} />
        </Field>
        <Button type="submit" disabled={busy || !session} className="touch-target h-14 w-full text-lg font-bold">
          {busy ? "Salvando…" : "Atualizar Tanque"}
        </Button>
      </form>
    </div>
  );
}
