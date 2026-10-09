import * as XLSX from "xlsx";

export const legacyFields = [
  { key: "license_plate", label: "Placa", aliases: ["placa", "licenseplate", "veiculo", "placadoveiculo"] },
  { key: "odometer", label: "Hodômetro (km)", aliases: ["hodometro", "odometro", "odometer", "km", "quilometragem"] },
  { key: "liters", label: "Litros", aliases: ["litros", "liters", "litragem", "quantidade", "quantidadelitros"] },
  { key: "fuel_date_time", label: "Data/Hora", aliases: ["datahora", "data", "datadoabastecimento", "fuel_datetime", "fueldatetime", "dataabastecimento"] },
  { key: "tank_location", label: "Tanque", aliases: ["tanque", "tanklocation", "origem", "origemdotanque", "local"] },
] as const;
export type LegacyField = (typeof legacyFields)[number]["key"];
export type ColumnMap = Record<LegacyField, string>;
export type LegacyRecord = { license_plate: string; odometer: number; liters: number; fuel_date_time: string; tank_location: string; import_key: string };
export type LegacyIssue = { row: number; message: string };
export type LegacySheet = { name: string; index: number; headers: string[]; rows: { row: number; values: unknown[] }[] };
const normalize = (v: string) => v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

export function readLegacySheets(buffer: ArrayBuffer, filename = "planilha.xlsx"): LegacySheet[] {
  const workbook = /\.csv$/i.test(filename)
    ? XLSX.read(new TextDecoder("utf-8").decode(buffer), { type: "string", raw: true })
    : XLSX.read(buffer, { type: "array", cellDates: true });
  return workbook.SheetNames.map((name, index) => {
    const worksheet = workbook.Sheets[name];
    if (!worksheet) return { name, index, headers: [], rows: [] };
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, defval: "", blankrows: true });
    const headerIndex = matrix.findIndex((row) => row.some((cell) => String(cell).trim()));
    const headers = (matrix[headerIndex] ?? []).map((cell, i) => String(cell).trim() || `Coluna ${i + 1}`);
    return { name, index, headers, rows: matrix.slice(headerIndex + 1).map((values, i) => ({ row: headerIndex + i + 2, values })).filter(({ values }) => values.some((v) => String(v).trim())) };
  });
}

export function suggestColumns(headers: string[]): ColumnMap {
  return Object.fromEntries(legacyFields.map((field) => {
    const index = headers.findIndex((header) => field.aliases.some((alias) => normalize(alias) === normalize(header)));
    return [field.key, index < 0 ? "" : String(index)];
  })) as ColumnMap;
}

export function legacyNumber(value: unknown): number {
  if (typeof value === "number") return value;
  const text = String(value ?? "").trim().replace(/\s/g, "");
  if (!text || !/^-?[\d.,]+$/.test(text)) return NaN;
  return Number(text.includes(",") ? text.replace(/\./g, "").replace(",", ".") : text);
}

export function legacyDate(value: unknown): string | null {
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value.toISOString() : null;
  if (typeof value === "number") {
    const parts = XLSX.SSF.parse_date_code(value);
    if (!parts) return null;
    return new Date(parts.y, parts.m - 1, parts.d, parts.H, parts.M, Math.floor(parts.S)).toISOString();
  }
  const text = String(value ?? "").trim();
  const br = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ ,T]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/);
  if (!br && !iso) return null;
  const year = Number(br ? br[3] : iso?.[1]);
  const month = Number(br ? br[2] : iso?.[2]);
  const day = Number(br ? br[1] : iso?.[3]);
  const hour = Number((br ?? iso)?.[4] ?? 0), minute = Number((br ?? iso)?.[5] ?? 0), second = Number((br ?? iso)?.[6] ?? 0);
  const date = new Date(year, month - 1, day, hour, minute, second);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day || hour > 23 || minute > 59 || second > 59) return null;
  if (iso?.[7]) {
    const zoned = new Date(text.replace(" ", "T"));
    return Number.isFinite(zoned.getTime()) ? zoned.toISOString() : null;
  }
  return date.toISOString();
}

export function validateLegacy(sheet: LegacySheet, columns: ColumnMap, digest: string) {
  const records: LegacyRecord[] = [], issues: LegacyIssue[] = [];
  if (legacyFields.some(({ key }) => columns[key] === "")) return { records, issues };
  for (const { row, values } of sheet.rows) {
    const cell = (key: LegacyField) => values[Number(columns[key])];
    const plate = String(cell("license_plate") ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    const odometer = legacyNumber(cell("odometer")), liters = legacyNumber(cell("liters"));
    const date = legacyDate(cell("fuel_date_time"));
    const tank = normalize(String(cell("tank_location") ?? "")).replace(/^tanque/, "");
    const errors: string[] = [];
    if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(plate)) errors.push("placa inválida");
    if (!Number.isFinite(odometer) || odometer < 0) errors.push("hodômetro inválido");
    if (!Number.isFinite(liters) || liters <= 0) errors.push("litros devem ser maiores que zero");
    if (!date) errors.push("data inválida");
    if (tank !== "leste" && tank !== "norte") errors.push("tanque deve ser Leste ou Norte");
    if (errors.length || !date) issues.push({ row, message: errors.join("; ") });
    else records.push({ license_plate: plate, odometer, liters, fuel_date_time: date, tank_location: tank === "leste" ? "Leste" : "Norte", import_key: `${digest}:${sheet.index}:${row}` });
  }
  return { records, issues };
}