import { RecoilState, atom } from "recoil";
import { PromptInput } from "./types";
import { DEFAULT_ACTION } from "../config/config";
import { WritingTone } from "../config/tones";
import { NEW_DOC_KEY } from "../constant";

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

export const activeCategoryMenuState = atom({
  key: "activeCategoryMenuState",
  default: null as string | null,
});

export const showChatState = atom({
  key: "showChat",
  default: true,
});

export const currentDocumentState = atom({
  key: "document",
  default: NEW_DOC_KEY as string,
});

export const currentChatDocumentState = atom({
  key: "chatDocument",
  default: NEW_DOC_KEY as string,
});

export const showDocumentState = atom({
  key: "showDocument",
  default: false,
});
