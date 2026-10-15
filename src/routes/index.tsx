import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Controle de Abastecimento | Bidtech" },
      { name: "description", content: "Sistema de controle de abastecimento de frota e nível de tanques Leste e Norte." },
      { property: "og:title", content: "Controle de Abastecimento | Bidtech" },
      { property: "og:description", content: "Registro de consumo, nível de tanques e pedidos de combustível." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    void (async () => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) { await navigate({ to: '/login', replace: true }); return; }
      const role = await supabase.rpc('has_role', { _user_id: user.data.user.id, _role: 'admin' });
      await navigate({ to: role.data && window.innerWidth >= 1024 ? '/gestao' : '/consumo', replace: true });
    })();
  }, [navigate]);
  return <div className="flex min-h-screen items-center justify-center bg-navy text-navy-foreground">Carregando…</div>;
}
