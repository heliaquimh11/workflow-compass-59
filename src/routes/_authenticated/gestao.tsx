import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { ArrowUpDown, Download, Droplets, Images, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fmtDateTime, fmtNum } from "@/lib/fuel";

export const Route = createFileRoute("/_authenticated/gestao")({
  head: () => ({
    meta: [
      { title: "Gestão e Análise de Consumo | Controle de Abastecimento" },
      { name: "description", content: "Dashboard em tempo real dos tanques, busca por placa e exportação para Excel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:title", content: "Gestão e Análise de Consumo" },
      { property: "og:description", content: "Tanques em tempo real, histórico por veículo e relatórios." },
    ],
  }),
  component: Gestao,
});

type Log = Tables<"fuel_logs">;
type Level = Tables<"tank_levels">;
type Req = Tables<"fuel_requests">;
type SortKey = "fuel_date_time" | "license_plate" | "odometer" | "liters" | "tank_location";
const PAGE = 15;

async function readAll<T>(table: "fuel_logs" | "tank_levels" | "fuel_requests"): Promise<T[]> {
  const rows: T[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase.from(table).select("*").order("id").range(offset, offset + 499);
    if (error) throw error;
    rows.push(...(data as unknown as T[]));
    if (data.length < 500) return rows;
  }
}

function Gestao() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [reqs, setReqs] = useState<Req[]>([]);
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<{ k: SortKey; asc: boolean }>({ k: "fuel_date_time", asc: false });
  const [page, setPage] = useState(0);
  const [gallery, setGallery] = useState<{ title: string; urls: string[] } | null>(null);

  const load = async () => {
    try {
      const [a, b, c] = await Promise.all([readAll<Log>("fuel_logs"), readAll<Level>("tank_levels"), readAll<Req>("fuel_requests")]);
      setLogs(a); setLevels(b); setReqs(c);
    } catch { toast.error("Não foi possível carregar os registros."); }
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("gestao-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "tank_levels" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "fuel_logs" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "fuel_requests" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const latest = (t: string) =>
    levels
      .filter((l) => l.tank_name === t)
      .sort((x, y) => +new Date(y.measurement_date_time) - +new Date(x.measurement_date_time))[0];

  const plates = useMemo(() => Array.from(new Set(logs.map((l) => l.license_plate))).sort(), [logs]);

  const filtered = useMemo(() => {
    const q = search.trim().toUpperCase();
    return logs
      .filter((l) => !q || l.license_plate.includes(q))
      .filter((l) => !from || new Date(l.fuel_date_time) >= new Date(from + "T00:00"))
      .filter((l) => !to || new Date(l.fuel_date_time) <= new Date(to + "T23:59:59"))
      .sort((a, b) => {
        const va = a[sort.k], vb = b[sort.k];
        const r = sort.k === "odometer" || sort.k === "liters" ? Number(va) - Number(vb)
          : sort.k === "fuel_date_time" ? +new Date(va as string) - +new Date(vb as string)
          : String(va).localeCompare(String(vb));
        return sort.asc ? r : -r;
      });
  }, [logs, search, from, to, sort]);

  useEffect(() => setPage(0), [search, from, to]);

  const totalLiters = filtered.reduce((s, l) => s + Number(l.liters), 0);
  const lastOdo = filtered.length
    ? [...filtered].sort((a, b) => +new Date(b.fuel_date_time) - +new Date(a.fuel_date_time))[0]?.odometer
    : null;
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const rows = filtered.slice(page * PAGE, page * PAGE + PAGE);

  const toggleSort = (k: SortKey) => setSort((s) => ({ k, asc: s.k === k ? !s.asc : true }));

  const exportXlsx = async () => {
    try {
    const [logs, levels, reqs] = await Promise.all([readAll<Log>("fuel_logs"), readAll<Level>("tank_levels"), readAll<Req>("fuel_requests")]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(logs.map((l) => ({
      ID: l.id, "Criado em": fmtDateTime(l.created_at), "Usuário": l.user_id, Placa: l.license_plate,
      "Hodômetro": Number(l.odometer), Litros: Number(l.liters), "Data/Hora": fmtDateTime(l.fuel_date_time),
      Tanque: l.tank_location, Fotos: (l.photo_urls ?? []).join(" | "),
    }))), "Abastecimentos");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(levels.map((l) => ({
      ID: l.id, "Criado em": fmtDateTime(l.created_at), "Usuário": l.user_id, Tanque: l.tank_name,
      Litros: Number(l.current_liters), "Data/Hora": fmtDateTime(l.measurement_date_time), Fotos: (l.photo_urls ?? []).join(" | "),
    }))), "Níveis Tanques");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reqs.map((r) => ({
      ID: r.id, "Criado em": fmtDateTime(r.created_at), "Usuário": r.user_id, "Nível atual": Number(r.current_tank_level),
      "Litros solicitados": Number(r.requested_liters), "Data/Hora pedido": fmtDateTime(r.request_date_time),
      "Última entrega": fmtDateTime(r.last_delivery_date_time), Status: r.status, Fotos: (r.photo_urls ?? []).join(" | "),
    }))), "Pedidos");
    XLSX.writeFile(wb, `abastecimento_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Relatório exportado!");
    } catch { toast.error("Não foi possível exportar os registros."); }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("fuel_requests").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Status atualizado"); load(); }
  };

  const Th = ({ k, children }: { k: SortKey; children: React.ReactNode }) => (
    <th className="px-4 py-3 text-left">
      <button onClick={() => toggleSort(k)} className="flex items-center gap-1 font-bold uppercase tracking-wide">
        {children} <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
      </button>
    </th>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold uppercase">Análise e Controle de Consumo</h1>
          <p className="text-muted-foreground">Atualização em tempo real</p>
        </div>
        <Button onClick={exportXlsx} className="touch-target gap-2 px-6 text-base font-bold">
          <Download className="h-5 w-5" /> Exportar para Excel
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(["Leste", "Norte"] as const).map((t) => {
          const l = latest(t);
          
          return (
            <div key={t} className="relative overflow-hidden rounded-2xl bg-navy p-6 text-navy-foreground shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-primary">Tanque {t}</p>
                  <p className="mt-2 font-display text-6xl font-bold">
                    {l ? fmtNum(l.current_liters) : "—"} <span className="text-2xl text-navy-foreground/60">L</span>
                  </p>
                  <p className="mt-1 text-sm text-navy-foreground/60">
                    {l ? `Última medição: ${fmtDateTime(l.measurement_date_time)}` : "Sem medições"}
                  </p>
                </div>
                <Droplets className="h-10 w-10 text-primary" />
              </div>

            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input list="plates" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por Veículo (Placa)" className="h-12 pl-10 text-lg uppercase" />
            <datalist id="plates">{plates.map((p) => <option key={p} value={p} />)}</datalist>
          </div>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-12" aria-label="Data inicial" />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-12" aria-label="Data final" />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Kpi label="Total consumido" value={`${fmtNum(totalLiters)} L`} />
          <Kpi label="Último hodômetro" value={lastOdo != null ? `${fmtNum(lastOdo)} km` : "—"} />
          <Kpi label="Registros" value={String(filtered.length)} />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-navy-2 text-navy-foreground">
              <tr>
                <Th k="fuel_date_time">Data/Hora</Th>
                <Th k="license_plate">Placa</Th>
                <Th k="odometer">Hodômetro</Th>
                <Th k="liters">Litros</Th>
                <Th k="tank_location">Tanque</Th>
                <th className="px-4 py-3 text-left font-bold uppercase tracking-wide">Fotos</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id} className="border-t hover:bg-muted">
                  <td className="px-4 py-3">{fmtDateTime(l.fuel_date_time)}</td>
                  <td className="px-4 py-3 font-mono font-bold">{l.license_plate}</td>
                  <td className="px-4 py-3">{fmtNum(l.odometer)}</td>
                  <td className="px-4 py-3 font-semibold">{fmtNum(l.liters)}</td>
                  <td className="px-4 py-3">{l.tank_location}</td>
                  <td className="px-4 py-3">
                    <Button variant="outline" size="sm" onClick={() => setGallery({ title: `${l.license_plate} · ${fmtDateTime(l.fuel_date_time)}`, urls: l.photo_urls })} className="gap-1">
                      <Images className="h-4 w-4" /> {l.photo_urls.length}
                    </Button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Nenhum registro encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t px-4 py-3">
          <span className="text-sm text-muted-foreground">Página {page + 1} de {pages}</span>
          <div className="flex gap-2">
            <Button variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</Button>
            <Button variant="outline" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Próxima</Button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <h2 className="border-b px-4 py-3 text-2xl font-bold uppercase">Pedidos de Combustível</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr className="text-left">
                <th className="px-4 py-2">Data/Hora</th><th className="px-4 py-2">Nível atual</th><th className="px-4 py-2">Solicitado</th>
                <th className="px-4 py-2">Última entrega</th><th className="px-4 py-2">Fotos</th><th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {reqs.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-2">{fmtDateTime(r.request_date_time)}</td>
                  <td className="px-4 py-2">{fmtNum(r.current_tank_level)} L</td>
                  <td className="px-4 py-2 font-semibold">{fmtNum(r.requested_liters)} L</td>
                  <td className="px-4 py-2">{fmtDateTime(r.last_delivery_date_time)}</td>
                  <td className="px-4 py-2">
                    {(r.photo_urls ?? []).length > 0 && (
                      <Button variant="outline" size="sm" onClick={() => setGallery({ title: "Pedido " + fmtDateTime(r.request_date_time), urls: r.photo_urls ?? [] })}>
                        <Images className="h-4 w-4" /> {(r.photo_urls ?? []).length}
                      </Button>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)} className="h-9 rounded-md border bg-card px-2 font-semibold">
                      {["Pendente", "Aprovado", "Concluído", "Cancelado"].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {reqs.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">Nenhum pedido.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!gallery} onOpenChange={(o) => !o && setGallery(null)}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <DialogHeader><DialogTitle>{gallery?.title}</DialogTitle></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            {gallery?.urls.map((u, i) => (
              <a key={u} href={u} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border">
                <img src={u} alt={`Evidência ${i + 1}`} className="w-full" />
              </a>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border-l-4 border-primary bg-muted p-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="font-display text-3xl font-bold">{value}</p>
    </div>
  );
}
