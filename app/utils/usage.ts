import Stripe from "stripe";
import {
  ADMIN_EMAILS,
  FREE_MONTHLY_USAGE,
  MAX_MONTHLY_USAGE,
} from "../constant";
import { supabase } from "./supabaseClient";
export function countWords(text: string) {
  return text.trim().split(/\s+/).length;
}

export function countTokens(text: string) {
  // Split the text into words and count them
  // const wordCount = text.split(/\s+/).length;

  // Count the number of individual characters
  const charCount = text.split(/\s/).join("").length;

  // The total token count is the sum of the word count and the character count
  const tokenCount = charCount;

  return tokenCount;
}

export const getUsageLimit = async (userEmail: string) => {
  const stripe = new Stripe(
    process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY as string,
  );

  // find subscription in stripe
  if (!stripe) {
    return FREE_MONTHLY_USAGE;
  }

  // find customer by email
  const customer = await stripe.customers.list({
    email: userEmail,
    limit: 1,
  });

  if (customer.data.length === 0) {
    return FREE_MONTHLY_USAGE;
  }

  const subscriptions = await stripe.subscriptions.list({
    limit: 1,
    customer: customer.data[0].id,
  });

  return subscriptions.data.length > 0 ? MAX_MONTHLY_USAGE : FREE_MONTHLY_USAGE;
};

export const usageLimitCheck = async (
  userId: string,
  userEmail: string,
): Promise<boolean | Error> => {
  const prod = process.env.NODE_ENV === "production";

  if (prod && ADMIN_EMAILS.includes(userEmail)) {
    console.log("[bypassing usage limit check]: ", userEmail);
    return true; // Admin users have no usage limit.
  }

  try {
    const { data: usageData, error } = await supabase
      .from("usage")
      .select("monthly_usage")
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    const usageLimit = await getUsageLimit(userEmail);

    if (usageData.length === 0 || usageData[0].monthly_usage >= usageLimit) {
      return false; // User has no usage data or has exceeded the monthly usage.
    }

    return true; // User exists, has usage data, and has not exceeded the monthly usage.
  } catch (error) {
    console.error("An error occurred:", error);
    return new Error("Unexpected error");
  }
};

export const updateUsage = async (userId: string, usage: number) => {
  console.log("[update usage]: ", userId, usage);
  const { data: usageData, error: usageError } = await supabase
    .from("usage")
    .select("monthly_usage")
    .eq("user_id", userId);

  if (usageError) {
    console.error("Error retrieving user usage:", usageError);
    return usageError;
  }

  const currentUsage = usageData[0]?.monthly_usage || 0;
  const newUsage = currentUsage + usage;

  const { error } = await supabase.from("usage").upsert(
    {
      user_id: userId,
      monthly_usage: newUsage,
    },
    {
      onConflict: "user_id",
    },
  );

  if (error) {
    console.error(error);
    return error;
  }
};

export const getUsage = async (userId: string) => {
  console.log("[get usage]: ", userId);
  const { data: usageData, error } = await supabase
    .from("usage")
    .select("monthly_usage")
    .eq("user_id", userId);

  if (error) {
    console.error("Error retrieving user usage:", error);
    return error;
  }

  if (usageData.length === 0) {
    // create new usage record
    const { error: insertError } = await supabase.from("usage").insert([
      {
        user_id: userId,
        monthly_usage: 0,
      },
    ]);
    return 0;
  }

  return usageData[0]?.monthly_usage || 0;
};
