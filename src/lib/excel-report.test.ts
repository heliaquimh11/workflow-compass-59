import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import type { Tables } from "@/integrations/supabase/types";
import { createFuelReport } from "./excel-report";

describe("Clean Excel export", () => {
  it("omits all photo columns, URLs and hyperlinks on every sheet", () => {
    const base = { id: "test-id", created_at: "2026-10-09T12:00:00Z", user_id: "test-user", is_test: true, photo_urls: ["https://example.com/photo.jpg"] };
    const logs: Tables<"fuel_logs">[] = [{ ...base, license_plate: "ABC1D23", odometer: 100, liters: 20, fuel_date_time: base.created_at, tank_location: "Leste", is_legacy: false, import_key: null, source_file: null }];
    const levels: Tables<"tank_levels">[] = [{ ...base, tank_name: "Norte", current_liters: 50, measurement_date_time: base.created_at }];
    const requests: Tables<"fuel_requests">[] = [{ ...base, current_tank_level: 50, requested_liters: 100, request_date_time: base.created_at, last_delivery_date_time: base.created_at, status: "Pendente" }];
    const workbook = createFuelReport(logs, levels, requests);
    expect(workbook.SheetNames).toHaveLength(3);
    for (const sheet of Object.values(workbook.Sheets)) {
      expect(JSON.stringify(sheet)).not.toMatch(/https?:\/\/|Fotos|photo_urls/);
      for (const [key, cell] of Object.entries(sheet)) if (!key.startsWith("!")) expect(cell).not.toHaveProperty("l");
    }
    const sheet = workbook.Sheets["Abastecimentos"];
    if (!sheet) throw new Error("Missing report sheet");
    expect(XLSX.utils.sheet_to_json(sheet)[0]).toMatchObject({ Litros: 20, "Hodômetro": 100 });
  });
});