import { useMemo, useRef, useState } from "react";
import { FileSpreadsheet, LoaderCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { legacyFields, readLegacySheets, suggestColumns, validateLegacy, type ColumnMap, type LegacySheet } from "@/lib/legacy-import";
import { fmtDateTime, fmtNum } from "@/lib/fuel";

export function LegacyImport({ disabled, onImported }: { disabled: boolean; onImported: () => void }) {
  const [open, setOpen] = useState(false);
  const [sheets, setSheets] = useState<LegacySheet[]>([]);
  const [selected, setSelected] = useState(0);
  const [columns, setColumns] = useState<ColumnMap>(suggestColumns([]));
  const [filename, setFilename] = useState("");
  const [digest, setDigest] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ imported: number; duplicates: number } | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const sheet = sheets[selected];
  const mapped = legacyFields.every(({ key }) => columns[key] !== "");
  const validation = useMemo(() => sheet ? validateLegacy(sheet, columns, digest) : { records: [], issues: [] }, [sheet, columns, digest]);

  const selectFile = async (file?: File) => {
    if (!file) return;
    setError(""); setResult(null); setSheets([]); setFilename("");
    if (!/\.(xlsx|csv)$/i.test(file.name)) { setError("Selecione uma planilha .xlsx ou .csv."); return; }
    if (file.size > 20 * 1024 * 1024) { setError("O arquivo deve ter no máximo 20 MB."); return; }
    setBusy(true);
    try {
      const buffer = await file.arrayBuffer();
      const parsed = readLegacySheets(buffer, file.name);
      const first = parsed[0];
      if (!first || !parsed.some((s) => s.rows.length)) throw new Error("A planilha não contém registros.");
      const hash = await crypto.subtle.digest("SHA-256", buffer);
      setDigest(Array.from(new Uint8Array(hash), (v) => v.toString(16).padStart(2, "0")).join(""));
      setSheets(parsed); setSelected(0); setColumns(suggestColumns(first.headers)); setFilename(file.name);
    } catch (err) { setError(err instanceof Error ? err.message : "Não foi possível abrir a planilha."); }
    finally { setBusy(false); }
  };

  const importRows = async () => {
    if (!mapped || validation.issues.length || !validation.records.length || disabled) return;
    setBusy(true); setError("");
    try {
      const { data, error } = await supabase.rpc("import_legacy_fuel_logs", { records: validation.records, filename });
      if (error) throw error;
      if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Resposta de importação inválida.");
      const counts = { imported: Number(data["imported"]), duplicates: Number(data["duplicates"]) };
      setResult(counts); onImported();
      toast.success(`${counts.imported} abastecimentos importados.`);
    } catch (err) { setError(err instanceof Error ? err.message : String((err as { message?: string })?.message ?? "Não foi possível importar.")); }
    finally { setBusy(false); }
  };

  return <>
    <Button variant="outline" disabled={disabled} onClick={() => setOpen(true)} className="touch-target gap-2">
      <Upload className="h-5 w-5" /> Importar Planilha
    </Button>
    <Dialog open={open} onOpenChange={(value) => { if (!busy) setOpen(value); }}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto" onEscapeKeyDown={(e) => { if (busy) e.preventDefault(); }} onPointerDownOutside={(e) => { if (busy) e.preventDefault(); }}>
        <DialogHeader>
          <DialogTitle>Importar Abastecimentos Legados</DialogTitle>
          <DialogDescription>Planilha .xlsx ou .csv · Fotos opcionais · Até 10.000 registros por aba</DialogDescription>
        </DialogHeader>
        <input ref={input} aria-label="Planilha legada" type="file" accept=".xlsx,.csv" className="hidden" disabled={busy} onChange={(e) => { void selectFile(e.target.files?.[0]); e.target.value = ""; }} />
        <div className="flex min-h-24 items-center justify-between gap-3 rounded-lg border-2 border-dashed border-primary bg-muted p-4" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (!busy) void selectFile(e.dataTransfer.files[0]); }}>
          <div className="flex min-w-0 items-center gap-3"><FileSpreadsheet className="h-8 w-8 shrink-0 text-cyan-deep" /><span className="break-all text-sm font-medium">{filename || "Planilha .xlsx ou .csv"}</span></div>
          <Button variant="outline" disabled={busy} onClick={() => input.current?.click()}><Upload className="mr-2 h-4 w-4" /> Selecionar</Button>
        </div>
        {sheet && <>
          <label className="grid gap-1 text-sm font-semibold">Aba
            <select aria-label="Aba da planilha" disabled={busy} className="h-12 rounded-md border bg-card px-3" value={selected} onChange={(e) => { const index = Number(e.target.value); const next = sheets[index]; if (!next) return; setSelected(index); setColumns(suggestColumns(next.headers)); setResult(null); setError(""); }}>
              {sheets.map((s, i) => <option key={s.index} value={i}>{s.name} ({s.rows.length} registros)</option>)}
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {legacyFields.map(({ key, label }) => <label key={key} className="grid gap-1 text-sm font-semibold">{label}
              <select aria-label={`Coluna ${label}`} disabled={busy} value={columns[key]} className="h-12 min-w-0 rounded-md border bg-card px-3" onChange={(e) => { setColumns((current) => ({ ...current, [key]: e.target.value })); setResult(null); }}>
                <option value="">Selecionar coluna</option>
                {sheet.headers.map((header, i) => <option key={i} value={i}>{header}</option>)}
              </select>
            </label>)}
          </div>
          {mapped && <>
            <p className="text-sm font-semibold">{validation.records.length} válidos · {validation.issues.length} com erro</p>
            {validation.issues.length > 0 && <div role="alert" className="max-h-40 overflow-y-auto rounded-md border border-destructive p-3 text-sm text-destructive">
              {validation.issues.slice(0, 100).map((issue) => <p key={issue.row}>Linha {issue.row}: {issue.message}</p>)}
              {validation.issues.length > 100 && <p>Mais {validation.issues.length - 100} linhas com erro.</p>}
            </div>}
            <div className="overflow-x-auto rounded-md border"><table className="w-full text-sm"><thead className="bg-muted"><tr>{["Placa", "Hodômetro", "Litros", "Data/Hora", "Tanque"].map((h) => <th key={h} className="px-3 py-2 text-left">{h}</th>)}</tr></thead><tbody>
              {validation.records.slice(0, 5).map((row) => <tr key={row.import_key} className="border-t"><td className="px-3 py-2 font-mono">{row.license_plate}</td><td className="px-3 py-2">{fmtNum(row.odometer)}</td><td className="px-3 py-2">{fmtNum(row.liters)}</td><td className="whitespace-nowrap px-3 py-2">{fmtDateTime(row.fuel_date_time)}</td><td className="px-3 py-2">{row.tank_location}</td></tr>)}
            </tbody></table></div>
          </>}
          {sheet.rows.length > 10000 && <p role="alert" className="text-sm text-destructive">Limite de 10.000 registros por aba excedido.</p>}
        </>}
        {error && <p role="alert" className="break-words text-sm text-destructive">{error}</p>}
        {result && <p role="status" className="text-sm font-semibold text-cyan-deep">{result.imported} importados · {result.duplicates} já importados</p>}
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="outline" disabled={busy} onClick={() => setOpen(false)}>Fechar</Button>
          <Button disabled={busy || disabled || !mapped || !validation.records.length || !!validation.issues.length || (sheet?.rows.length ?? 0) > 10000 || !!result} onClick={importRows}>
            {busy ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />} {busy ? "Processando…" : `Importar ${validation.records.length} registros`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </>;
}