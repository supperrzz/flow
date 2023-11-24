import { MAX_MONTHLY_USAGE } from "../constant";
import { supabase } from "./supabaseClient";

export const usageLimitCheck = async (
  userId: string,
): Promise<boolean | Error> => {
  try {
    const { data: usageData, error: usageError } = await supabase
      .from("usage")
      .select("monthly_usage")
      .eq("user_id", userId); // Assuming the column is 'user_id'.

    if (usageError) {
      console.error("Error retrieving user usage:", usageError);
      return new Error("Usage retrieval error");
    }

    if (
      usageData.length === 0 ||
      usageData[0].monthly_usage >= MAX_MONTHLY_USAGE
    ) {
      return false; // User has no usage data or has exceeded the monthly usage.
    }
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    return new Error("Unexpected error");
  }
  return true; // User exists, has usage data, and has not exceeded the monthly usage.
};
