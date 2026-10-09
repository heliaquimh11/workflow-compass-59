import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { legacyDate, legacyNumber, readLegacySheets, suggestColumns, validateLegacy } from "./legacy-import";

const hash = "a".repeat(64);
function fixture(rows: unknown[][]) {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([["Placa", "Hodômetro", "Litros", "Data/Hora", "Tanque"], ...rows]), "Histórico");
  const sheet = readLegacySheets(XLSX.write(workbook, { type: "array", bookType: "xlsx" }))[0];
  if (!sheet) throw new Error("Missing fixture sheet");
  return sheet;
}
describe("Legacy ingestion", () => {
  it("maps columns and imports old plates with Brazilian values, without photos", () => {
    const sheet = fixture([["ABC-1234", "12.345,5", "42,5", "09/10/2026 09:30", "Tanque Leste"]]);
    const { records, issues } = validateLegacy(sheet, suggestColumns(sheet.headers), hash);
    expect(issues).toEqual([]);
    expect(records[0]).toMatchObject({ license_plate: "ABC1234", odometer: 12345.5, liters: 42.5, tank_location: "Leste", import_key: `${hash}:0:2` });
    expect(records[0]).not.toHaveProperty("photo_urls");
  });
  it("rejects invalid dates, tank, plate and nonpositive liters", () => {
    const sheet = fixture([["X", -1, 0, "31/02/2026", "Sul"]]);
    const result = validateLegacy(sheet, suggestColumns(sheet.headers), hash);
    expect(result.records).toHaveLength(0);
    expect(result.issues[0]?.message).toContain("data inválida");
    expect(result.issues[0]?.row).toBe(2);
  });
  it("preserves source row positions and ignores blank rows", () => {
    const sheet = fixture([["ABC1D23", 0, 10, 45939, "Norte"], [], ["DEF1234", 30, 20, "2026-10-09T12:00:00Z", "Leste"]]);
    const result = validateLegacy(sheet, suggestColumns(sheet.headers), hash);
    expect(result.records.map((row) => row.import_key)).toEqual([`${hash}:0:2`, `${hash}:0:4`]);
  });
  it("validates numeric and date edge cases", () => {
    expect(legacyNumber("")).toBeNaN();
    expect(legacyNumber("5L")).toBeNaN();
    expect(legacyDate("09/10/2026 25:00")).toBeNull();
    expect(legacyDate("2026-02-30")).toBeNull();
    expect(legacyDate("2026-10-09T12:30:00Z")).toBe("2026-10-09T12:30:00.000Z");
  });
});