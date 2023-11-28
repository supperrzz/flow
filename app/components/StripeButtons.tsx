import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Locale from "../locales";
import { IconButton } from "./button";
import AddIcon from "../icons/chatgpt.svg";
import BotIcon from "../icons/bot.svg";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string,
);

export const SubscribeButton = ({
  isSubscribed,
}: {
  isSubscribed: boolean;
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const goToCheckout = async () => {
    console.log("goToCheckout");
    setLoading(true);
    setError("");

    const stripe = await stripePromise;
    if (!stripe) {
      console.log("Stripe not loaded");
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error("No user data found");
      return;
    }

    const { error } = await stripe.redirectToCheckout({
      lineItems: [{ price: "price_1OGFdOCuyL2Oyw2fV0QTMwdg", quantity: 1 }],
      mode: "subscription",
      successUrl: `${window.location.origin}`,
      cancelUrl: `${window.location.origin}`,
      customerEmail: user.email,
    });

    if (error) {
      setError(error.message ?? "An unknown error occurred");
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    }
  }, [success]);

  if (isSubscribed) {
    return (
      <IconButton
        icon={<BotIcon />}
        bordered
        text={Locale.Settings.Subscription.Subscribed}
        disabled
      />
    );
  }
  return (
    <IconButton
      icon={<AddIcon />}
      bordered
      text={Locale.Settings.Subscription.Upgrade}
      onClick={() => goToCheckout()}
      disabled={loading}
      type="primary"
    />
  );
};

export const CancelSubscriptionButton = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    }
  }, [success]);

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error("No user data found");
      return;
    }

    const { error } = await supabase
      .from("subscriptions")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      setError(error.message ?? "An unknown error occurred");
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  return (
    <button
      type="submit"
      className="btn btn-primary btn-block"
      disabled={loading}
      onClick={handleSubmit}
    >
      {loading ? "Loading..." : "Cancel Subscription"}
    </button>
  );
};
