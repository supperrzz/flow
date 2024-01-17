import { Action } from "../state/types";

export const GrammarCorrection: Action = {
  name: "grammarCorrection",
  inputs: [
    {
      type: "textArea",
      id: "text",
      label: "Text",
      placeholder: "Paste the text you want to correct",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Analyze the provided text and correct any grammatical errors found in: '${payload.text}'.`,
};

export const PassiveToActive: Action = {
  name: "passiveToActive",
  inputs: [
    {
      type: "textArea",
      id: "sentence",
      label: "Sentence",
      placeholder: "Enter the sentence in passive voice",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Convert the provided passive voice sentence into active voice: '${payload.sentence}'.`,
};

export const SentenceRewriter: Action = {
  name: "sentenceRewriter",
  inputs: [
    {
      type: "textArea",
      id: "sentence",
      label: "Sentence",
      placeholder: "Enter the sentence you want to rewrite",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Rewrite the provided sentence in the provided tone: '${payload.sentence}'.`,
  tone: true,
};

export const Paraphraser: Action = {
  name: "paraphraser",
  inputs: [
    {
      type: "textArea",
      id: "text",
      label: "Text",
      placeholder: "Paste the text you want to paraphrase",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Paraphrase the provided text to convey the same meaning using different words: '${payload.text}'.`,
  tone: true,
};

export default {
  grammarCorrection: GrammarCorrection,
  passiveToActive: PassiveToActive,
  sentenceRewriter: SentenceRewriter,
  paraphraser: Paraphraser,
};
