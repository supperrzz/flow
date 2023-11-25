import { MAX_MONTHLY_USAGE } from "../constant";
import { supabase } from "./supabaseClient";
export function countWords(text: string) {
  return text.trim().split(/\s+/).length;
}

export function countTokens(text: string) {
  // Split the text into words and count them
  const wordCount = text.split(/\s+/).length;

  // Count the number of individual characters
  const charCount = text.split(/\s/).join("").length;

  // The total token count is the sum of the word count and the character count
  const tokenCount = wordCount + charCount;

  return tokenCount;
}
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

export const getUsage = async (userId: string): Promise<number | Error> => {
  const { data: usageData, error: usageError } = await supabase
    .from("usage")
    .select("monthly_usage")
    .eq("user_id", userId); // Assuming the column is 'user_id'.

  if (usageError) {
    console.error("Error retrieving user usage:", usageError);
    return new Error("Usage retrieval error");
  }
  if (!usageData[0].monthly_usage) {
    return new Error("User has no usage data");
  }

  return Number(usageData[0].monthly_usage || 0);
};

export const updateUsage = async (userId: string, usage: number) => {
  const currentCount = await getUsage(userId);
  if (currentCount instanceof Error) {
    return console.error(currentCount);
  }
  const { error } = await supabase
    .from("usage")
    .update({ monthly_usage: currentCount + usage })
    .eq("user_id", userId);
  if (error) {
    console.error(error);
  }
};
