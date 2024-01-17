import { WritingTone } from "../config/tones";
import ACTIONS from "../actions";

export function camelToTitle(camelString: string) {
  // Insert a space before all caps, then uppercase the first character of each word
  return camelString.replace(/([A-Z])/g, " $1").replace(/^./, function (str) {
    return str.toUpperCase();
  });
}

export const renderPrompt = (
  key: string,
  payload: Record<string, string>,
  tone: WritingTone,
) => {
  console.log("key", key);
  const { prompt, tone: hasTone } = ACTIONS[key as keyof typeof ACTIONS];
  if (hasTone) return `${prompt(payload)} in a ${tone.toLowerCase()} tone.`;
  return prompt(payload);
};
