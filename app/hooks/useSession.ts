import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { Session } from "@supabase/supabase-js";
import { useAccessStore } from "../store";
import { useSetRecoilState } from "recoil";
import { currentUserState } from "../state";
import Stripe from "stripe";
import { getUsage } from "../utils/usage";
import { useSyncStore } from "../store/sync";

const useSession = () => {
  const [session, setSession] = useState<Session | null>();
  const [loading, setLoading] = useState(true);
  const setUser = useSetRecoilState(currentUserState);
  const accessStore = useAccessStore();
  const syncStore = useSyncStore();
  const stripe = new Stripe(
    process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY as string,
  );
  const [isSubscribed, setIsSubscribed] = useState(false);

  const checkSubscription = async (userEmail: string) => {
    // find subscription in stripe
    if (!stripe) {
      return false;
    }

    // find customer by email
    const customer = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    if (customer.data.length === 0) {
      return false;
    }

    const subscriptions = await stripe.subscriptions.list({
      limit: 1,
      customer: customer.data[0].id,
    });

    const subscription = subscriptions.data[0];

    if (!subscription) {
      return false;
    }
    const isSubscribed = subscription.status === "active";

    setIsSubscribed(isSubscribed);
  };

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
          syncStore.sync();
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

  useEffect(() => {
    if (session?.user) {
      accessStore.setUser(session.user);
      setUser(session.user);
      checkSubscription(session.user.email!);
      getUsage(session.user.id!);
    }
  }, [session]);

  useEffect(() => {
    accessStore.setIsSubscribed(isSubscribed);
  }, [isSubscribed]);

  return { session, loading };
};

export default useSession;
