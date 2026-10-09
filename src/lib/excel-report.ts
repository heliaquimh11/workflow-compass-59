import * as XLSX from "xlsx";
import type { Tables } from "@/integrations/supabase/types";
import { fmtDateTime } from "@/lib/fuel";

export function createFuelReport(logs: Tables<"fuel_logs">[], levels: Tables<"tank_levels">[], requests: Tables<"fuel_requests">[]) {
  const workbook = XLSX.utils.book_new();
  const append = (name: string, headers: string[], rows: Record<string, unknown>[]) => {
    const sheet = XLSX.utils.json_to_sheet(rows, { header: headers });
    sheet["!cols"] = headers.map((header) => ({ wch: header.includes("Data") || header.includes("Criado") || header.includes("entrega") ? 22 : header === "ID" || header === "Usuário" ? 38 : 20 }));
    sheet["!autofilter"] = { ref: sheet["!ref"] ?? "A1:A1" };
    XLSX.utils.book_append_sheet(workbook, sheet, name);
  };
  append("Abastecimentos", ["ID", "Criado em", "Usuário", "Placa", "Hodômetro", "Litros", "Data/Hora", "Tanque"], logs.map((log) => ({
    ID: log.id, "Criado em": fmtDateTime(log.created_at), "Usuário": log.user_id, Placa: log.license_plate,
    "Hodômetro": Number(log.odometer), Litros: Number(log.liters), "Data/Hora": fmtDateTime(log.fuel_date_time), Tanque: log.tank_location,
  })));
  append("Níveis Tanques", ["ID", "Criado em", "Usuário", "Tanque", "Litros", "Data/Hora"], levels.map((level) => ({
    ID: level.id, "Criado em": fmtDateTime(level.created_at), "Usuário": level.user_id, Tanque: level.tank_name,
    Litros: Number(level.current_liters), "Data/Hora": fmtDateTime(level.measurement_date_time),
  })));
  append("Pedidos", ["ID", "Criado em", "Usuário", "Nível atual", "Litros solicitados", "Data/Hora pedido", "Última entrega", "Status"], requests.map((request) => ({
    ID: request.id, "Criado em": fmtDateTime(request.created_at), "Usuário": request.user_id, "Nível atual": Number(request.current_tank_level),
    "Litros solicitados": Number(request.requested_liters), "Data/Hora pedido": fmtDateTime(request.request_date_time), "Última entrega": fmtDateTime(request.last_delivery_date_time), Status: request.status,
  })));
  return workbook;
}