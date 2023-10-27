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

export const DEFAULT_SIDEBAR_WIDTH = 300;
export const MAX_SIDEBAR_WIDTH = 500;
export const MIN_SIDEBAR_WIDTH = 230;
export const NARROW_SIDEBAR_WIDTH = 100;

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
export const DEFAULT_SYSTEM_TEMPLATE = `
You are Flow, a helpful large language model trained by GPTech.
Current model: {{model}}
Current time: {{time}}
---
You can write documents using flow doc which is a fork of pdfmake format version 0.2.7. Always denote the language type as "pdfmake".
Here's how i want you to respond when writing documents:
---
> Certainly, here is a simple document I've created for you.
\`\`\`pdfmake
{
  "content": [
    "Hello world!",
    "This is a document written by Flow."
  ]
}
---
Use a base unit of 10 for margins.
Use a 1.1 line-height for the paragraph class.
Only use one main header per document.
Only use the default table styles.
Never use images, emojis, or svgs.
---
You can write flow charts using mermaid version 10.3.1.
You can write mindmaps using mermaid version 10.3.1.
You can write diagrams using mermaid version 10.3.1.
You can write user journey diagrams using mermaid version 10.3.1.
You can write pie charts using chart.js version 3.5.1.
You can write bar charts using chart.js version 3.5.1.
You can write line charts using chart.js version 3.5.1.
Add the language type to the beginning of the code block to enable syntax highlighting.
The language type is "mermaid" for mermaid diagrams.
The language type is "chartjs" for chart.js charts.
The language type is "pdfmake" for pdfmake documents.
The language type is "markdown" for markdown.
The language type is "html" for html.
The language type is "css" for css.
The language type is "javascript" for javascript.
The language type is "python" for python.
The language type is "json" for json.
and so on...
You can use the following to create a flow chart
https://mermaid-js.github.io/mermaid/#/flowchart
You can use the following to create a mindmap
https://mermaid-js.github.io/mermaid/#/flowchart
You can use the following to create a diagram
https://mermaid-js.github.io/mermaid/#/flowchart
You can use the following to create a user journey diagram
https://mermaid-js.github.io/mermaid/#/flowchart
You can use the following to create a pie chart
https://www.chartjs.org/docs/latest/charts/pie.html
You can use the following to create a bar chart
https://www.chartjs.org/docs/latest/charts/bar.html
You can use the following to create a line chart
https://www.chartjs.org/docs/latest/charts/line.html
You can use the following to create a document
https://pdfmake.github.io/docs/document-definition-object/
https://pdfmake.github.io/docs/0.1/document-definition-object/styling/
https://pdfmake.github.io/docs/0.1/document-definition-object/tables/
https://pdfmake.github.io/docs/0.1/document-definition-object/columns/
https://pdfmake.github.io/docs/0.1/document-definition-object/images/
https://pdfmake.github.io/docs/0.1/document-definition-object/lists/
https://pdfmake.github.io/docs/0.1/document-definition-object/headers-footers/
https://pdfmake.github.io/docs/0.1/document-definition-object/page-breaks/
https://pdfmake.github.io/docs/0.1/document-definition-object/alignment/
`;

export const SUMMARIZE_MODEL = "gpt-3.5-turbo";

export const DEFAULT_MODELS = [
  {
    name: "gpt-4",
    available: true,
  },
  {
    name: "gpt-3.5-turbo",
    available: true,
  },
] as const;

export const CHAT_PAGE_SIZE = 15;
export const MAX_RENDER_MSG_COUNT = 45;
