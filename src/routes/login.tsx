import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Eye, EyeOff, Fuel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { loginAccount } from '@/lib/access.functions';

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({
    meta: [
      { title: "Entrar | Abastecimento Bidtech" },
      { name: "description", content: "Entrada individual no controle de abastecimento Bidtech." },
      { property: "og:title", content: "Entrar | Abastecimento Bidtech" },
      { property: "og:description", content: "Acesso seguro aos registros de abastecimento." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function Login() {
  const navigate = useNavigate();
  const login = useServerFn(loginAccount);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return <div className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
    <form className="w-full max-w-sm space-y-6" onSubmit={async (event) => {
      event.preventDefault(); setBusy(true); setError('');
      try {
        const result = await login({ data: { username, password } });
        if (result.error || !result.session) { setError(result.error ?? 'Não foi possível entrar.'); return; }
        const saved = await supabase.auth.setSession(result.session);
        if (saved.error) { setError('Não foi possível manter o acesso.'); return; }
        setPassword(''); await navigate({ to: '/gestao', replace: true });
      } catch { setError('Não foi possível entrar. Tente novamente.'); }
      finally { setBusy(false); }
    }}>
      <Fuel className="h-10 w-10 text-primary" />
      <h1 className="text-4xl font-bold uppercase">Abastecimento Bidtech</h1>
      <label className="block space-y-2"><span className="font-semibold">Usuário</span><Input aria-label="Usuário" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} required className="h-14 text-lg" /></label>
      <label className="block space-y-2"><span className="font-semibold">Senha</span><div className="relative"><Input aria-label="Senha" type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required className="h-14 pr-16 text-lg" /><Button type="button" variant="ghost" aria-label={show ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShow(!show)} className="absolute right-0 top-0 h-14 w-14">{show ? <EyeOff /> : <Eye />}</Button></div></label>
      {error && <p role="alert" className="text-destructive">{error}</p>}
      <Button disabled={busy} type="submit" className="h-14 w-full text-lg font-bold">{busy ? 'Entrando…' : 'Entrar'}</Button>
    </form>
  </div>;
}
