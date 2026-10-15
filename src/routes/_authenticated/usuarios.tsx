import { createFileRoute, redirect } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Eye, EyeOff, KeyRound, Plus, RefreshCw, Shield, UserCheck, UserX, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/lib/auth';
import { createAccount, listAccounts, changeAccount } from '@/lib/users.functions';
import { suggestLogin, passwordError, type AccountRole } from '@/lib/user-policy';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { fmtDateTime } from '@/lib/fuel';

export const Route = createFileRoute('/_authenticated/usuarios')({
  beforeLoad: async () => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw redirect({ to: '/login' });
    const result = await supabase.rpc('has_role', { _user_id: user.data.user.id, _role: 'admin' });
    if (!result.data) throw redirect({ to: '/consumo' });
  },
  head: () => ({ meta: [
    { title: 'Usuários | Abastecimento Bidtech' }, { name: 'description', content: 'Administração de contas e permissões do controle de abastecimento Bidtech.' },
    { property: 'og:title', content: 'Usuários | Abastecimento Bidtech' }, { property: 'og:description', content: 'Gerenciamento administrativo de usuários e acesso.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' },
  ] }),
  component: Accounts,
});

type Account = Awaited<ReturnType<typeof listAccounts>>[number];
function Accounts() {
  const fetchUsers = useServerFn(listAccounts), createUser = useServerFn(createAccount), changeUser = useServerFn(changeAccount);
  const { session } = useSession();
  const query = useQuery({ queryKey: ['admin-users'], queryFn: () => fetchUsers() });
  const [dialog, setDialog] = useState<{ type: 'create' | 'password' | 'role' | 'activate' | 'deactivate'; user?: Account } | null>(null);
  const [role, setRole] = useState<AccountRole>('colaborador');
  const [name, setName] = useState(''), [login, setLogin] = useState(''), [password, setPassword] = useState('');
  const [edited, setEdited] = useState(false), [confirmed, setConfirmed] = useState(false), [show, setShow] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const open = (type: NonNullable<typeof dialog>['type'], user?: Account) => {
    setDialog({ type, user }); setRole(type === 'role' ? (user?.role === 'admin' ? 'colaborador' : 'admin') : user?.role ?? 'colaborador');
    setName(''); setLogin(''); setPassword(''); setEdited(false); setConfirmed(false); setShow(false); setError('');
  };
  const needsPassword = dialog?.type === 'create' || dialog?.type === 'password' || (dialog?.type === 'role' && role === 'admin');
  const needsConfirmation = role === 'admin' && (dialog?.type === 'create' || dialog?.type === 'role');
  const titles = { create: 'Criar usuário', password: 'Redefinir senha', role: role === 'admin' ? 'Promover a administrador' : 'Rebaixar a colaborador', activate: 'Ativar usuário', deactivate: 'Desativar usuário' };
  return <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><h1 className="flex items-center gap-3 text-4xl font-bold uppercase"><Users className="h-8 w-8 text-primary" />Usuários</h1><div className="flex gap-2"><Button variant="outline" aria-label="Atualizar usuários" title="Atualizar usuários" onClick={() => query.refetch()}><RefreshCw className="h-5 w-5" /></Button><Button className="touch-target gap-2" onClick={() => open('create')}><Plus className="h-5 w-5" />Criar usuário</Button></div></div>
    {query.isPending ? <p role="status">Carregando usuários…</p> : query.isError ? <div role="alert" className="space-y-3"><p>Não foi possível carregar os usuários.</p><Button onClick={() => query.refetch()}>Tentar novamente</Button></div> : <div className="overflow-x-auto border bg-card"><table className="w-full text-left text-sm"><thead className="bg-muted"><tr>{['Nome', 'Login', 'Classe', 'Estado', 'Criado em', 'Último acesso', 'Ações'].map(h => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead><tbody>{query.data?.map(u => <tr key={u.id} className="border-t"><td className="px-4 py-3 font-semibold">{u.display_name}</td><td className="px-4 py-3 font-mono">{u.username}</td><td className="px-4 py-3">{u.role === 'admin' ? 'Administrador' : 'Colaborador'}</td><td className="px-4 py-3">{u.active ? 'Ativo' : 'Inativo'}</td><td className="whitespace-nowrap px-4 py-3">{fmtDateTime(u.created_at)}</td><td className="whitespace-nowrap px-4 py-3">{u.last_access_at ? fmtDateTime(u.last_access_at) : 'Nunca acessou'}</td><td className="px-4 py-3"><div className="flex gap-1"><Button variant="outline" aria-label={`Redefinir senha de ${u.username}`} title="Redefinir senha" onClick={() => open('password', u)}><KeyRound className="h-4 w-4" /></Button><Button variant="outline" aria-label={`Alterar classe de ${u.username}`} title={u.id === session?.user.id ? 'Não é permitido alterar a própria classe' : 'Alterar classe'} disabled={u.id === session?.user.id} onClick={() => open('role', u)}><Shield className="h-4 w-4" /></Button><Button variant="outline" aria-label={`${u.active ? 'Desativar' : 'Ativar'} ${u.username}`} title={u.active ? 'Desativar' : 'Ativar'} onClick={() => open(u.active ? 'deactivate' : 'activate', u)}>{u.active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}</Button></div></td></tr>)}</tbody></table>{!query.data?.length && <p className="p-6 text-center">Nenhum usuário encontrado.</p>}</div>}
    <Dialog open={!!dialog} onOpenChange={o => { if (!busy && !o) { setDialog(null); setPassword(''); } }}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{dialog ? titles[dialog.type] : ''}</DialogTitle><DialogDescription>{dialog?.user?.display_name ?? 'Nova conta'}</DialogDescription></DialogHeader>
      <form className="space-y-4" onSubmit={async e => {
        e.preventDefault(); if (!dialog) return; setError('');
        if (needsPassword) { const invalid = passwordError(password, role, login || dialog.user?.username || ''); if (invalid) { setError(invalid); return; } }
        setBusy(true);
        try {
          if (dialog.type === 'create') await createUser({ data: { name, login, role, password, confirmed } });
          else if (dialog.user) await changeUser({ data: { id: dialog.user.id, action: dialog.type, role, password: needsPassword ? password : undefined, confirmed } });
          setPassword(''); setDialog(null); await query.refetch(); toast.success('Alteração confirmada.');
        } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível salvar.'); }
        finally { setBusy(false); }
      }}>
        {dialog?.type === 'create' && <><fieldset className="space-y-2"><legend className="font-semibold">Classe</legend><div className="grid grid-cols-2 gap-2">{(['colaborador', 'admin'] as const).map(r => <Button type="button" key={r} variant={r === role ? 'default' : 'outline'} aria-pressed={r === role} onClick={() => setRole(r)}>{r === 'admin' ? 'Administrador' : 'Colaborador'}</Button>)}</div></fieldset><label className="block space-y-2"><span className="font-semibold">{role === 'colaborador' ? 'Nome completo' : 'Nome'}</span><Input aria-label="Nome completo" value={name} required minLength={3} maxLength={150} onChange={e => { setName(e.target.value); if (!edited) setLogin(suggestLogin(e.target.value)); }} className="h-12" /></label><label className="block space-y-2"><span className="font-semibold">Login</span><Input aria-label="Login" value={login} required pattern="[a-z0-9][a-z0-9._\-]{2,31}" maxLength={32} onChange={e => { setEdited(true); setLogin(e.target.value.toLowerCase()); }} className="h-12" /></label></>}
        {needsPassword && <label className="block space-y-2"><span className="font-semibold">{dialog?.type === 'create' ? 'Senha inicial' : 'Nova senha'}</span><div className="relative"><Input aria-label="Senha inicial" type={show ? 'text' : 'password'} autoComplete="new-password" required minLength={role === 'admin' ? 10 : 6} maxLength={256} value={password} onChange={e => setPassword(e.target.value)} className="h-12 pr-14" /><Button type="button" variant="ghost" aria-label={show ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShow(!show)} className="absolute right-0 top-0 h-12 w-12">{show ? <EyeOff /> : <Eye />}</Button></div><span className="text-sm text-muted-foreground">Mínimo de {role === 'admin' ? 10 : 6} caracteres</span></label>}
        {needsConfirmation && <label className="flex items-start gap-3 border p-3"><input type="checkbox" checked={confirmed} required onChange={e => setConfirmed(e.target.checked)} className="mt-1 h-5 w-5" /><span>Esta pessoa poderá editar, excluir e criar usuários</span></label>}
        {dialog?.type === 'deactivate' && <p>O acesso desta conta será bloqueado imediatamente.</p>}
        {error && <p role="alert" className="text-destructive">{error}</p>}
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={busy} onClick={() => { setDialog(null); setPassword(''); }}>Cancelar</Button><Button type="submit" disabled={busy || (needsConfirmation && !confirmed)}>{busy ? 'Salvando…' : 'Confirmar'}</Button></div>
      </form></DialogContent></Dialog>
  </div>;
}