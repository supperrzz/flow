import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { Session } from "@supabase/supabase-js";

const useSession = () => {
  const [session, setSession] = useState<Session | null>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    async function getInitialSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted) {
        if (session) {
          setSession(session);
        }
        setLoading(false);
      }
    }

    getInitialSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      },
    );

    return () => {
      mounted = false;

      subscription.subscription?.unsubscribe();
    };
  }, []);

  return { session, loading };
};

export default useSession;
