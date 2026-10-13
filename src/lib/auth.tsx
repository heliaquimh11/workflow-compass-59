import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const SessionContext = createContext<{ session: Session | null; loading: boolean; error: string | null; retry: () => void }>({ session: null, loading: true, error: null, retry: () => {} });

export function SessionProvider({ children, onIdentityChange }: { children: ReactNode; onIdentityChange: (signedOut: boolean) => void }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      if (!active) return;
      setSession(s?.user.is_anonymous ? null : s);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') onIdentityChange(event === 'SIGNED_OUT');
    });
    supabase.auth.getUser().then(async ({ data, error }) => {
      if (!active) return;
      if (error || !data.user || data.user.is_anonymous) { setSession(null); setLoading(false); return; }
      const result = await supabase.auth.getSession();
      if (active) { setSession(result.data.session); setLoading(false); }
    }).catch((err: unknown) => {
      if (active) {
        setError(err instanceof Error ? err.message : "Não foi possível validar o acesso.");
        setLoading(false);
      }
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, [attempt, onIdentityChange]);
  return <SessionContext.Provider value={{ session, loading, error, retry: () => setAttempt((value) => value + 1) }}>{children}</SessionContext.Provider>;
}

export function useSession() { return useContext(SessionContext); }
