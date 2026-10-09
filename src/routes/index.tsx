import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

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
    navigate({ to: window.innerWidth < 1024 ? "/consumo" : "/gestao", replace: true });
  }, [navigate]);
  return <div className="flex min-h-screen items-center justify-center bg-navy text-navy-foreground">Carregando…</div>;
}
