import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { Session } from "@supabase/supabase-js";
import { useAccessStore } from "../store";
import { useSetRecoilState } from "recoil";
import { currentUserState } from "../state";
import Stripe from "stripe";
import { getUsage } from "../utils/usage";
import { ADMIN_EMAILS } from "../constant";

const useSession = () => {
  const [session, setSession] = useState<Session | null>();
  const [loading, setLoading] = useState(true);
  const setUser = useSetRecoilState(currentUserState);
  const accessStore = useAccessStore();
  const stripe = new Stripe(
    process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY as string,
  );
  const [isSubscribed, setIsSubscribed] = useState(false);

  const checkSubscription = async (userEmail: string) => {
    const prod = process.env.NODE_ENV === "production";
    if (prod && ADMIN_EMAILS.includes(session?.user?.email!)) {
      console.log("[setting admin subscription]: ", session?.user?.email);
      setIsSubscribed(true);
      return;
    }

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

    setIsSubscribed(subscriptions.data.length > 0);
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
    if (session) {
      accessStore.setUser(session.user);
      setUser(session.user);
      console.log("checking subscription");
      checkSubscription(session.user.email!);
      getUsage(session.user.id!);
    } else {
      accessStore.setUser(null);
      setUser(null);
    }
  }, [session]);

  useEffect(() => {
    accessStore.setIsSubscribed(isSubscribed);
  }, [isSubscribed]);

  return { session, loading };
};

export default useSession;
