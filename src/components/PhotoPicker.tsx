import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PhotoPicker({
  files,
  onChange,
  min = 0,
}: {
  files: File[];
  onChange: (f: File[]) => void;
  min?: number;
}) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const depth = useRef(0);
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p)), [previews]);

  const add = (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list);
    const images = incoming.filter((file) => file.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(file.name));
    setError(images.length !== incoming.length ? "Somente arquivos de imagem são aceitos." : "");
    onChange([...files, ...images]);
  };

  return (
    <div
      aria-label="Área de envio de fotos"
      className={`space-y-3 rounded-lg border-2 border-dashed p-3 transition-colors ${dragging ? "border-primary bg-primary/10" : "border-border"}`}
      onDragEnter={(e) => { e.preventDefault(); depth.current++; setDragging(true); }}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
      onDragLeave={(e) => { e.preventDefault(); depth.current = Math.max(0, depth.current - 1); if (depth.current === 0) setDragging(false); }}
      onDrop={(e) => { e.preventDefault(); depth.current = 0; setDragging(false); add(e.dataTransfer.files); }}
    >
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
      {dragging && <p className="text-center text-sm font-semibold text-cyan-deep">Solte as fotos aqui</p>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((p, i) => (
            <div key={p} className="relative aspect-square overflow-hidden rounded-md border">
              <img src={p} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                aria-label="Remover foto"
                onClick={() => onChange(files.filter((_, j) => j !== i))}
                className="photo-remove absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
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
