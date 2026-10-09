import { useEffect, useMemo } from "react";
import { Camera, ImagePlus, X } from "lucide-react";

export function PhotoPicker({
  files,
  onChange,
  min = 0,
}: {
  files: File[];
  onChange: (f: File[]) => void;
  min?: number;
}) {
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p)), [previews]);

  const add = (list: FileList | null) => {
    if (!list) return;
    onChange([...files, ...Array.from(list)]);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="touch-target flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-navy px-4 py-3 font-semibold text-navy-foreground active:opacity-80">
          <Camera className="h-5 w-5" /> Câmera
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
        </label>
        <label className="touch-target flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary bg-card px-4 py-3 font-semibold text-cyan-deep active:opacity-80">
          <ImagePlus className="h-5 w-5" /> Galeria
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
        </label>
      </div>
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((p, i) => (
            <div key={p} className="relative aspect-square overflow-hidden rounded-md border">
              <img src={p} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                aria-label="Remover foto"
                onClick={() => onChange(files.filter((_, j) => j !== i))}
                className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      {min > 0 && (
        <p className={`text-sm font-medium ${files.length >= min ? "text-cyan-deep" : "text-muted-foreground"}`}>
          {files.length} de no mínimo {min} fotos
        </p>
      )}
    </div>
  );
}
