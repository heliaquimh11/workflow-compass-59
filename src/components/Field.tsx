import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

export function Field({ label, children, htmlFor }: { label: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-base font-semibold">{label}</Label>
      {children}
    </div>
  );
}

export const inputCls = "h-12 text-lg bg-card";

export function TankToggle({ value, onChange }: { value: string; onChange: (v: "Leste" | "Norte") => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {(["Leste", "Norte"] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={`touch-target rounded-lg border-2 text-lg font-bold transition ${
            value === t ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card text-foreground"
          }`}
        >
          Tanque {t}
        </button>
      ))}
    </div>
  );
}
