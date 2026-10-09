import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

let pendingAccess: Promise<Session | null> | undefined;

function ensureTestAccess() {
  if (pendingAccess) return pendingAccess;
  pendingAccess = (async () => {
    const { data: existing } = await supabase.auth.getSession();
    if (existing.session) {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) throw new Error("Não foi possível validar o acesso. Tente novamente.");
      return existing.session;
    }
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.session) throw new Error("Não foi possível iniciar os testes. Tente novamente.");
    return data.session;
  })().finally(() => { pendingAccess = undefined; });
  return pendingAccess;
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    const { data } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
    });
    ensureTestAccess().then((session) => {
      if (active) { setSession(session); setLoading(false); }
    }).catch((err: unknown) => {
      if (active) {
        setError(err instanceof Error ? err.message : "Não foi possível iniciar os testes.");
        setLoading(false);
      }
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, [attempt]);
  return { session, loading, error, retry: () => setAttempt((value) => value + 1) };
}
