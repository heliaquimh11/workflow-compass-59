import { supabase } from "@/integrations/supabase/client";

export const BUCKET = "fuel-attachments";
export const TANKS = ["Leste", "Norte"] as const;
export type Tank = (typeof TANKS)[number];

export function nowLocalInput(d = new Date()) {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

export function localInputToISO(v: string) {
  return new Date(v).toISOString();
}

/** Máscara de placa: ABC1D23 (Mercosul) ou ABC1234 */
export function formatPlate(raw: string) {
  const s = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  let out = "";
  for (let i = 0; i < s.length && out.length < 7; i++) {
    const c = s.charAt(i);
    const pos = out.length;
    if (pos < 3 && /[A-Z]/.test(c)) out += c;
    else if (pos === 3 && /[0-9]/.test(c)) out += c;
    else if (pos === 4 && /[A-Z0-9]/.test(c)) out += c;
    else if (pos > 4 && /[0-9]/.test(c)) out += c;
  }
  return out;
}
export const PLATE_RE = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;

/** Upload em qualidade original (sem compressão), retorna URLs completas */
export async function uploadPhotos(
  files: File[],
  folder: string,
  userId: string,
  onProgress?: (done: number, total: number) => void,
) {
  const urls: string[] = [];
  let done = 0;
  for (const f of files) {
    const ext = f.name.split(".").pop() || "jpg";
    const path = `${folder}/${userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, f, { contentType: f.type, upsert: false });
    if (error) throw error;
    const { data, error: e2 } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    if (e2 || !data) throw e2 ?? new Error("Falha ao gerar URL");
    urls.push(data.signedUrl);
    done++;
    onProgress?.(done, files.length);
  }
  return urls;
}

export function fmtDateTime(v: string | null) {
  if (!v) return "";
  return new Date(v).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}
export function fmtNum(n: number | string | null) {
  return Number(n ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}
