import { RecoilState, atom, selector } from "recoil";
import { PromptInput } from "./types";
import { DEFAULT_ACTION } from "../config/config";
import { WritingTone } from "../config/tones";
import { Session, User } from "@supabase/supabase-js";
import { NEW_DOC_KEY } from "../constant";
import { ChatSession, DEFAULT_TOPIC } from "../store";
import { nanoid } from "nanoid";
import { createEmptyMask } from "../store/mask";

export const actionState = atom({
  key: "action",
  default: DEFAULT_ACTION,
});

export const toneState: RecoilState<WritingTone> = atom({
  key: "tone",
  default: "Neutral",
});

export const promptInputsState = atom({
  key: "promptInputs",
  default: [] as PromptInput[],
});

export const inputValuesState = atom({
  key: "inputValues",
  default: {} as Record<string, string>,
});

export const userState = atom({
  key: "userState",
  default: null as any,
});

export const sessionState = atom({
  key: "sessionState",
  default: null as Session | null,
});

export const activeCategoryMenuState = atom({
  key: "activeCategoryMenuState",
  default: null as string | null,
});

export const showChatState = atom({
  key: "showChat",
  default: true,
});

export const currentUserState = atom({
  key: "user",
  default: null as null | User,
});

export const currentDocumentState = atom({
  key: "document",
  default: NEW_DOC_KEY as string,
});

const sampleSessions: ChatSession[] = [
  {
    ...createEmptySession(),
    id: "1",
    topic: "Sample Session 1",
    memoryPrompt: "This is a sample session.",
  },
  {
    ...createEmptySession(),
    id: "2",
    topic: "Another Sample 2",
    memoryPrompt: "This is a sample session.",
  },
  {
    ...createEmptySession(),
    id: "3",
    topic: "Basic Example 3",
    memoryPrompt: "This is a sample session.",
  },
];

export function createEmptySession(): ChatSession {
  return {
    id: nanoid(),
    topic: DEFAULT_TOPIC,
    memoryPrompt: "",
    messages: [],
    stat: {
      tokenCount: 0,
      wordCount: 0,
      charCount: 0,
    },
    lastUpdate: Date.now(),
    lastSummarizeIndex: 0,

    mask: createEmptyMask(),
  };
}

// Define atoms
export const sessionsAtom = atom<ChatSession[]>({
  key: "sessions",
  default: [...sampleSessions],
});

export const currentSessionIndexAtom = atom<number>({
  key: "currentSessionIndex",
  default: 0,
});

// Define selectors
export const currentSessionSelector = selector<ChatSession>({
  key: "currentSession",
  get: ({ get }) => {
    const sessions = get(sessionsAtom);
    const currentSessionIndex = get(currentSessionIndexAtom);
    if (currentSessionIndex < 0 || currentSessionIndex >= sessions.length) {
      throw new Error("Current session index is out of bounds");
    }
    return sessions[currentSessionIndex];
  },
});
