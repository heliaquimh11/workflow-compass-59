import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3, Droplets, Fuel, Menu, Truck, X } from "lucide-react";
import { useSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: Layout,
});

const opTabs = [
  { to: "/consumo", label: "Abastecimento", icon: Fuel },
  { to: "/tanque", label: "Tanque", icon: Droplets },
  { to: "/pedido", label: "Pedir Combustível", icon: Truck },
] as const;

function Layout() {
  const { session, loading } = useSession();
  const [open, setOpen] = useState(false);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-navy text-navy-foreground">Carregando…</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <header className="sticky top-0 z-30 bg-navy text-navy-foreground shadow-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Fuel className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold uppercase tracking-wide">Abastecimento</span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {[...opTabs, { to: "/gestao", label: "Gestão", icon: BarChart3 } as const].map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className="touch-target flex items-center gap-2 rounded-md px-4 font-semibold text-navy-foreground/80 hover:bg-navy-2"
                activeProps={{ className: "bg-navy-2 !text-primary" }}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </Link>
            ))}
          </nav>
          <Button variant="ghost" aria-label="Menu" onClick={() => setOpen(!open)} className="flex h-12 w-12 items-center justify-center rounded-md lg:hidden">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
        {open && (
          <div className="border-t border-navy-2 bg-navy-2 px-4 py-2 lg:hidden">
            {[...opTabs, { to: "/gestao", label: "Gestão / Análise", icon: BarChart3 } as const].map((t) => (
              <Link
                key={t.to}
                to={t.to}
                onClick={() => setOpen(false)}
                className="touch-target flex items-center gap-3 rounded-md px-3 text-lg font-semibold"
                activeProps={{ className: "!text-primary" }}
              >
                <t.icon className="h-5 w-5" /> {t.label}
              </Link>
            ))}
          </div>
        )}
      </header>
      {!session && (
        <div role="status" className="border-b bg-muted px-4 py-3 text-center text-sm text-muted-foreground">
          Acesso temporário sem login. Registros e fotos permanecem protegidos; consulta, envio e exportação estão indisponíveis.
        </div>
      )}
      <main>
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t bg-navy lg:hidden">
        {opTabs.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold text-navy-foreground/70"
            activeProps={{ className: "!text-primary" }}
          >
            <t.icon className="h-6 w-6" />
            {t.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
