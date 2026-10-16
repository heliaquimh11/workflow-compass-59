import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { passwordError } from './user-policy';

async function requireAdmin(client: SupabaseClient<Database>, userId: string) {
  const { data, error } = await client.rpc('has_role', { _user_id: userId, _role: 'admin' });
  const operational = await client.rpc('can_operate');
  if (error || !data || operational.error || !operational.data) throw new Error('Acesso exclusivo para administradores ativos.');
}

function authError(code?: string) {
  if (code === 'weak_password') return 'O serviço recusou esta senha. Verifique a proteção de senhas vazadas nas configurações do Lovable Cloud.';
  if (code === 'email_exists' || code === 'user_already_exists') return 'Este login já está em uso.';
  return 'Não foi possível alterar a conta. Tente novamente.';
}

export const listAccounts = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  await requireAdmin(context.supabase, context.userId);
  const profiles: Database['public']['Tables']['profiles']['Row'][] = [];
  const roles: Database['public']['Tables']['user_roles']['Row'][] = [];
  for (let offset = 0; ; offset += 500) {
    const [p, r] = await Promise.all([
      context.supabase.from('profiles').select('*').order('id').range(offset, offset + 499),
      context.supabase.from('user_roles').select('*').order('user_id').range(offset, offset + 499),
    ]);
    if (p.error || r.error) throw new Error('Não foi possível carregar os usuários.');
    profiles.push(...p.data); roles.push(...r.data);
    if (p.data.length < 500 && r.data.length < 500) break;
  }
  return profiles.map(p => ({ ...p, role: roles.find(r => r.user_id === p.id)?.role ?? null }));
});

export const createAccount = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ name: z.string().trim().min(3).max(150), login: z.string().regex(/^[a-z0-9][a-z0-9._-]{2,31}$/), role: z.enum(['admin', 'colaborador']), password: z.string().max(256), confirmed: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const invalid = passwordError(data.password, data.role, data.login);
    if (invalid) throw new Error(invalid);
    if (data.role === 'admin' && !data.confirmed) throw new Error('Confirme os poderes do novo administrador.');
    const exists = await context.supabase.from('profiles').select('id').eq('username', data.login).maybeSingle();
    if (exists.error) throw new Error('Não foi possível conferir o login.');
    if (exists.data) throw new Error('Este login já está em uso.');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const created = await supabaseAdmin.auth.admin.createUser({ email: `${data.login}@users.invalid`, password: data.password, email_confirm: true });
    if (created.error || !created.data.user) throw new Error(authError(created.error?.code));
    const finalized = await supabaseAdmin.rpc('admin_finalize_account', { actor: context.userId, target: created.data.user.id, full_name: data.name, login_name: data.login, account_role: data.role, confirmed: data.confirmed });
    if (finalized.error) {
      const cleanup = await supabaseAdmin.auth.admin.deleteUser(created.data.user.id);
      if (cleanup.error) throw new Error('Criação incompleta: a conta ficou sem acesso. Solicite revisão administrativa.');
      throw new Error('Não foi possível concluir a criação; nenhuma conta com acesso foi criada.');
    }
    return { ok: true };
  });

export const changeAccount = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid(), action: z.enum(['activate', 'deactivate', 'role', 'password']), role: z.enum(['admin', 'colaborador']).optional(), password: z.string().max(256).optional(), confirmed: z.boolean().default(false) }).parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const [profile, roleRow] = await Promise.all([context.supabase.from('profiles').select('username').eq('id', data.id).single(), context.supabase.from('user_roles').select('role').eq('user_id', data.id).single()]);
    if (profile.error || roleRow.error) throw new Error('Usuário não encontrado.');
    if (data.action === 'role' && data.id === context.userId) throw new Error('Não altere a própria classe.');
    if (data.action === 'role' && data.role === 'admin' && !data.confirmed) throw new Error('Confirmação obrigatória.');
    if (data.action === 'password' || (data.action === 'role' && data.role === 'admin')) {
      const targetRole = data.action === 'role' ? 'admin' : roleRow.data.role;
      const invalid = passwordError(data.password ?? '', targetRole, profile.data.username);
      if (invalid) throw new Error(invalid);
      const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
      const changed = await supabaseAdmin.auth.admin.updateUserById(data.id, { password: data.password });
      if (changed.error) throw new Error(authError(changed.error.code));
      const audit = await supabaseAdmin.rpc('admin_audit_password_reset', { actor: context.userId, target: data.id });
      if (audit.error) throw new Error('Senha alterada, mas a auditoria não foi confirmada. Solicite revisão antes de continuar.');
      if (data.action === 'password') return { ok: true };
    }
    const rpcArgs: { target: string; action: string; confirmed: boolean; new_role?: 'admin' | 'colaborador' } = { target: data.id, action: data.action, confirmed: data.confirmed };
    if (data.role) rpcArgs.new_role = data.role;
    const result = await context.supabase.rpc('admin_manage_account', rpcArgs);
    if (result.error) throw new Error(result.error.message);
    return { ok: true };
  });