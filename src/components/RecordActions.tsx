import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

type Field = { key: string; label: string; type?: 'number' | 'text'; options?: string[] };
export function RecordActions({ table, id, values, fields, onSaved }: { table: 'fuel_logs' | 'tank_levels' | 'fuel_requests'; id: string; values: Record<string, string | number>; fields: Field[]; onSaved: () => void }) {
  const [mode, setMode] = useState<'edit' | 'delete' | null>(null), [patch, setPatch] = useState(values), [reason, setReason] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const open = (mode: 'edit' | 'delete') => { setMode(mode); setPatch(values); setReason(''); setError(''); };
  return <><div className="flex gap-1"><Button variant="outline" size="sm" title="Editar registro" aria-label={`Editar ${id}`} onClick={() => open('edit')}><Pencil className="h-4 w-4" /></Button><Button variant="outline" size="sm" title="Excluir registro" aria-label={`Excluir ${id}`} onClick={() => open('delete')}><Trash2 className="h-4 w-4" /></Button></div>
    <Dialog open={!!mode} onOpenChange={v => { if (!v && !busy) setMode(null); }}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{mode === 'edit' ? 'Editar registro' : 'Excluir registro'}</DialogTitle><DialogDescription>{id}</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={async e => {
      e.preventDefault(); setBusy(true); setError('');
      try { const result = await supabase.rpc('admin_mutate_record', { table_name: table, record_id: id, patch: mode === 'delete' ? {} : patch, reason, remove_record: mode === 'delete' }); if (result.error) throw result.error; setMode(null); toast.success('Alteração confirmada e auditada.'); onSaved(); } catch { setError('Não foi possível confirmar a alteração. Confira os dados e tente novamente.'); } finally { setBusy(false); }
    }}>
      {mode === 'edit' && fields.map(f => <label key={f.key} className="block space-y-2"><span className="font-semibold">{f.label}</span>{f.options ? <select className="h-12 w-full rounded-md border bg-card px-3" aria-label={f.label} value={patch[f.key]} onChange={e => setPatch(p => ({ ...p, [f.key]: e.target.value }))}>{f.options.map(o => <option key={o}>{o}</option>)}</select> : <Input aria-label={f.label} className="h-12" type={f.type ?? 'text'} step="any" required value={patch[f.key]} onChange={e => setPatch(p => ({ ...p, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))} />}</label>)}
      <label className="block space-y-2"><span className="font-semibold">Motivo obrigatório</span><Input aria-label="Motivo obrigatório" className="h-12" value={reason} required minLength={3} onChange={e => setReason(e.target.value)} /></label>
      {error && <p role="alert" className="text-destructive">{error}</p>}<div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={busy} onClick={() => setMode(null)}>Cancelar</Button><Button type="submit" variant={mode === 'delete' ? 'destructive' : 'default'} disabled={busy}>{busy ? 'Salvando…' : mode === 'delete' ? 'Confirmar exclusão' : 'Salvar alteração'}</Button></div>
    </form></DialogContent></Dialog></>;
}