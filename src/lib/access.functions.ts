import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

export const loginAccount = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => z.object({ username: z.string().min(3).max(254), password: z.string().min(1).max(256) }).parse(input))
  .handler(async ({ data }) => {
    const url = process.env['SUPABASE_URL'];
    const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
    if (!url || !key) return { error: 'Acesso temporariamente indisponível.', session: null };
    const username = data.username.trim().toLowerCase();
    const email = username.includes('@') ? username : `${username}@users.invalid`;
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
      headers.set('apikey', key);
      return fetch(input, { ...init, headers });
    } } });
    // The sole real-email emergency account may also use its protected display handle.
    const loginEmail = username === 'heliaquim' ? 'heliaquimsamuel@gmail.com' : email;
    const result = await client.auth.signInWithPassword({ email: loginEmail, password: data.password });
    if (result.error || !result.data.session) return { error: 'Usuário ou senha inválidos.', session: null };
    const profile = await client.from('profiles').select('active').eq('id', result.data.user.id).maybeSingle();
    if (profile.error || !profile.data?.active) {
      await client.auth.signOut();
      return { error: 'Conta indisponível. Procure o administrador.', session: null };
    }
    await client.rpc('record_access');
    return { error: null, session: { access_token: result.data.session.access_token, refresh_token: result.data.session.refresh_token } };
  });