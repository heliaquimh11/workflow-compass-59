import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Field, inputCls } from "@/components/Field";
import { PhotoPicker } from "@/components/PhotoPicker";
import { useSession } from "@/lib/auth";
import { localInputToISO, nowLocalInput, uploadPhotos } from "@/lib/fuel";

export const Route = createFileRoute("/_authenticated/pedido")({
  head: () => ({
    meta: [
      { title: "Pedir Combustível | Controle de Abastecimento" },
      { name: "description", content: "Solicitação de nova carga de combustível para a base." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:title", content: "Pedir Combustível" },
      { property: "og:description", content: "Solicite carga de combustível com confirmação prévia." },
    ],
  }),
  component: Pedido,
});

function Pedido() {
  const { session } = useSession();
  const [ack, setAck] = useState(false);
  const [current, setCurrent] = useState("");
  const [desired, setDesired] = useState("");
  const [dt, setDt] = useState(nowLocalInput());
  const [last, setLast] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    if (Number(desired) <= 0) { toast.error("Quantidade desejada deve ser maior que zero."); return; }
    if (!last) { toast.error("Informe a última entrega de combustível."); return; }
    setBusy(true);
    const tId = toast.loading("Enviando pedido…");
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Sessão expirada. Entre novamente.");
      const uid = u.user.id;
      const urls = files.length
        ? await uploadPhotos(files, "fuel_requests", uid, (d, t) => toast.loading(`Enviando fotos ${d}/${t}…`, { id: tId }))
        : [];
      const { error } = await supabase.from("fuel_requests").insert({
        user_id: uid,
        current_tank_level: Number(current),
        requested_liters: Number(desired),
        request_date_time: localInputToISO(dt),
        last_delivery_date_time: localInputToISO(last),
        photo_urls: urls,
      });
      if (error) throw error;
      toast.success("Pedido de combustível enviado!", { id: tId });
      setCurrent(""); setDesired(""); setDt(nowLocalInput()); setLast(""); setFiles([]);
    } catch (err) {
      toast.error("Erro: " + (err as Error).message, { id: tId });
    }
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <AlertDialog open={!ack}>
        <AlertDialogContent className="mobile-critical-sheet border-t-8 border-t-warning">
          <AlertDialogHeader>
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-warning text-warning-foreground">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <AlertDialogTitle className="text-center text-2xl">Atenção: Ação Crítica</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base text-foreground">
              Esta página é extremamente necessária. Tenha cuidado com os dados inseridos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAck(true)} className="touch-target w-full text-lg font-bold">
              Entendi / Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <h1 className="mb-1 text-3xl font-bold uppercase">Pedir Combustível</h1>
      <p className="mb-6 text-muted-foreground">Solicitação de carga para a base</p>
      {ack && (
        <form onSubmit={submit} className="space-y-5">
          <Field label="Quantidade atual do tanque (L)" htmlFor="cur">
            <Input id="cur" required type="number" inputMode="decimal" min={0} step="any" value={current} onChange={(e) => setCurrent(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Quantidade desejada (L)" htmlFor="des">
            <Input id="des" required type="number" inputMode="decimal" min={0} step="any" value={desired} onChange={(e) => setDesired(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Data e Hora" htmlFor="dt">
            <Input id="dt" required type="datetime-local" value={dt} onChange={(e) => setDt(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Última vez que chegou combustível na base" htmlFor="last">
            <Input id="last" required type="datetime-local" value={last} onChange={(e) => setLast(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Fotos de verificação">
            <PhotoPicker files={files} onChange={setFiles} />
          </Field>
          <Button type="submit" disabled={busy || !session} className="touch-target h-14 w-full text-lg font-bold">
            {busy ? "Enviando…" : "Enviar Pedido"}
          </Button>
        </form>
      )}
    </div>
  );
}
