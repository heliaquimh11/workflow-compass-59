import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
  head: () => ({
    meta: [
      { title: "Acesso Temporário | Controle de Abastecimento" },
      { name: "description", content: "Acesso temporário às telas de controle de abastecimento Bidtech sem login." },
      { property: "og:title", content: "Acesso Temporário | Controle de Abastecimento" },
      { property: "og:description", content: "Telas de abastecimento Bidtech com proteção dos registros e fotos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});
