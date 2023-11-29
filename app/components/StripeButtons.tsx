import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import Locale from "../locales";
import { IconButton } from "./button";
import AddIcon from "../icons/chatgpt.svg";
import BotIcon from "../icons/bot.svg";
import { useAccessStore } from "../store";
import Stripe from "stripe";
import { showConfirm } from "./ui-lib";

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
  const accessStore = useAccessStore();
  const user = accessStore.user;
  const goToCheckout = async () => {
    console.log("goToCheckout");
    setLoading(true);
    setError("");

    const stripe = await stripePromise;
    if (!stripe) {
      console.log("Stripe not loaded");
      return;
    }

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
  const accessStore = useAccessStore();
  const user = accessStore.user;
  const stripe = new Stripe(
    process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY as string,
  );

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    }
  }, [success]);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    // find customer by email
    const customer = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    if (customer.data.length === 0) {
      setError("No customer found");
      setLoading(false);
      return;
    }

    // find subscription
    const subscriptions = await stripe.subscriptions.list({
      limit: 1,
      customer: customer.data[0].id,
    });

    if (subscriptions.data.length === 0) {
      setError("No subscription found");
      setLoading(false);
      return;
    }

    const subscription = subscriptions.data[0];

    const deletedSubscription = await stripe.subscriptions.cancel(
      subscription.id,
    );

    console.log(deletedSubscription);

    if (error) {
      setLoading(false);
    } else {
      setSuccess(true);
      accessStore.setIsSubscribed(false);
    }
  };

  return (
    <IconButton
      text={Locale.Settings.Danger.Cancel.Action}
      onClick={async () => {
        if (await showConfirm(Locale.Settings.Danger.Cancel.Confirm)) {
          handleSubmit();
        }
      }}
      type="danger"
      disabled={loading}
    />
  );
};
