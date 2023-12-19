export const OWNER = "Yidadaa";
export const REPO = "Flow";
export const REPO_URL = `https://github.com/${OWNER}/${REPO}`;
export const ISSUE_URL = `https://github.com/${OWNER}/${REPO}/issues`;
export const UPDATE_URL = `${REPO_URL}#keep-updated`;
export const RELEASE_URL = `${REPO_URL}/releases`;
export const FETCH_COMMIT_URL = `https://api.github.com/repos/${OWNER}/${REPO}/commits?per_page=1`;
export const FETCH_TAG_URL = `https://api.github.com/repos/${OWNER}/${REPO}/tags?per_page=1`;
export const RUNTIME_CONFIG_DOM = "danger-runtime-config";

export const DEFAULT_CORS_HOST = "https://nb.nextweb.fun";
export const DEFAULT_API_HOST = `${DEFAULT_CORS_HOST}/api/proxy`;

export enum Path {
  Home = "/",
  Chat = "/chat",
  Settings = "/settings",
  NewChat = "/new-chat",
  Masks = "/masks",
  Auth = "/auth",
  Content = "/content",
  Dashboard = "/dashboard",
}

export enum ApiPath {
  Cors = "/api/cors",
}

export enum SlotID {
  AppBody = "app-body",
}

export enum FileName {
  Masks = "masks.json",
  Prompts = "prompts.json",
}

export enum StoreKey {
  Chat = "chat-next-web-store",
  Access = "access-control",
  Config = "app-config",
  Mask = "mask-store",
  Prompt = "prompt-store",
  Update = "chat-update",
  Sync = "sync",
}

export const DEFAULT_SIDEBAR_WIDTH = 330;
export const MAX_SIDEBAR_WIDTH = 500;
export const MIN_SIDEBAR_WIDTH = 330;
export const NARROW_SIDEBAR_WIDTH = 100;

export const DEFAULT_DOCUMENT_WIDTH = 750;
export const MAX_DOCUMENT_WIDTH = 816;
export const MIN_DOCUMENT_WIDTH = 210;
export const NARROW_DOCUMENT_WIDTH = 250;

export const ACCESS_CODE_PREFIX = "nk-";

export const LAST_INPUT_KEY = "last-input";
export const UNFINISHED_INPUT = (id: string) => "unfinished-input-" + id;

export const STORAGE_KEY = "chatgpt-next-web";

export const REQUEST_TIMEOUT_MS = 60000;

export const EXPORT_MESSAGE_CLASS_NAME = "export-markdown";

export const OpenaiPath = {
  ChatPath: "v1/chat/completions",
  UsagePath: "dashboard/billing/usage",
  SubsPath: "dashboard/billing/subscription",
  ListModelPath: "v1/models",
};

export const DEFAULT_INPUT_TEMPLATE = `{{input}}`; // input / time / model / lang
export const DEFAULT_SYSTEM_PROMPT = "";
export const DEFAULT_SYSTEM_TEMPLATE = `
You are Flow, a chat app trained by GPTech.
Current model: {{model}}
Current time: {{time}}
`;

export const SUMMARIZE_MODEL = "gpt-3.5-turbo";

export const DEFAULT_MODELS = [
  {
    name: "gpt-3.5-turbo",
    available: true,
  },
  // {
  //   name: "gpt-4",
  //   available: true,
  // },
  {
    name: "gpt-4-1106-preview",
    available: true,
  },
] as const;

export const MODEL_NAMES = {
  "gpt-4-1106-preview": "Turbo",
  // "gpt-4": "GPT-4",
  "gpt-3.5-turbo": "Default",
};

export const CHAT_PAGE_SIZE = 15;
export const MAX_RENDER_MSG_COUNT = 45;
export const FREE_MONTHLY_USAGE = 25000;
export const MAX_MONTHLY_USAGE = 150000;
export const NEW_DOC_KEY = "New Document";
