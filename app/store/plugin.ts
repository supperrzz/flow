import OpenAPIClientAxios from "openapi-client-axios";
import { StoreKey } from "../constant";
import { nanoid } from "nanoid";
import { createPersistStore } from "../utils/store";
import yaml from "js-yaml";
import { adapter } from "../utils";

export type Plugin = {
  id: string;
  createdAt: number;
  title: string;
  version: string;
  content: string;
  builtin: boolean;
  authType?: string;
  authLocation?: string;
  authHeader?: string;
  authToken?: string;
  usingProxy?: boolean;
};

export type FunctionToolItem = {
  type: string;
  function: {
    name: string;
    description?: string;
    parameters: Object;
  };
};

type FunctionToolServiceItem = {
  api: OpenAPIClientAxios;
  length: number;
  tools: FunctionToolItem[];
  funcs: Record<string, Function>;
};

export const FunctionToolService = {
  tools: {} as Record<string, FunctionToolServiceItem>,
  add(plugin: Plugin, replace = false) {
    if (!replace && this.tools[plugin.id]) return this.tools[plugin.id];
    const headerName = (
      plugin?.authType == "custom" ? plugin?.authHeader : "Authorization"
    ) as string;
    const tokenValue =
      plugin?.authType == "basic"
        ? `Basic ${plugin?.authToken}`
        : plugin?.authType == "bearer"
        ? ` Bearer ${plugin?.authToken}`
        : plugin?.authToken;
    const authLocation = plugin?.authLocation || "header";
    const definition = yaml.load(plugin.content) as any;
    const serverURL = definition?.servers?.[0]?.url;
    const baseURL = !!plugin?.usingProxy ? "/api/proxy" : serverURL;
    const headers: Record<string, string | undefined> = {
      "X-Base-URL": !!plugin?.usingProxy ? serverURL : undefined,
    };
    if (authLocation == "header") {
      headers[headerName] = tokenValue;
    }
    const api = new OpenAPIClientAxios({
      definition: yaml.load(plugin.content) as any,
      axiosConfigDefaults: {
        adapter: (window.__TAURI__ ? adapter : ["xhr"]) as any,
        baseURL,
        headers,
      },
    });
    try {
      api.initSync();
    } catch (e) {}
    const operations = api.getOperations();
    return (this.tools[plugin.id] = {
      api,
      length: operations.length,
      tools: operations.map((o) => {
        // @ts-ignore
        const parameters = o?.requestBody?.content["application/json"]
          ?.schema || {
          type: "object",
          properties: {},
        };
        if (!parameters["required"]) {
          parameters["required"] = [];
        }
        if (o.parameters instanceof Array) {
          o.parameters.forEach((p) => {
            // @ts-ignore
            if (p?.in == "query" || p?.in == "path") {
              // const name = `${p.in}__${p.name}`
              // @ts-ignore
              const name = p?.name;
              parameters["properties"][name] = {
                // @ts-ignore
                type: p.schema.type,
                // @ts-ignore
                description: p.description,
              };
              // @ts-ignore
              if (p.required) {
                parameters["required"].push(name);
              }
            }
          });
        }
        return {
          type: "function",
          function: {
            name: o.operationId,
            description: o.description || o.summary,
            parameters: parameters,
          },
        } as FunctionToolItem;
      }),
      funcs: operations.reduce((s, o) => {
        // @ts-ignore
        s[o.operationId] = function (args) {
          const parameters: Record<string, any> = {};
          if (o.parameters instanceof Array) {
            o.parameters.forEach((p) => {
              // @ts-ignore
              parameters[p?.name] = args[p?.name];
              // @ts-ignore
              delete args[p?.name];
            });
          }
          if (authLocation == "query") {
            parameters[headerName] = tokenValue;
          } else if (authLocation == "body") {
            args[headerName] = tokenValue;
          }
          // @ts-ignore
          return api.client[o.operationId](
            parameters,
            args,
            api.axiosConfigDefaults,
          );
        };
        return s;
      }, {}),
    });
  },
  get(id: string) {
    return this.tools[id];
  },
};

export const createEmptyPlugin = () =>
  ({
    id: nanoid(),
    title: "",
    version: "1.0.0",
    content: "",
    builtin: false,
    createdAt: Date.now(),
  }) as Plugin;

const BUILLTIN_PLUGINS = {
  "chat-with-pdf": {
    id: "chat-with-pdf",
    title: "Chat with PDF",
    version: "v1.0.0",
    content:
      '{\n  "openapi": "3.1.0",\n  "info": {\n    "description": "A GPT that allows the user to read data from a link.",\n    "title": "Chat with PDF",\n    "version": "v1.0.0"\n  },\n  "servers": [\n    {\n      "url": "https://gpt.chatpdf.aidocmaker.com"\n    }\n  ],\n  "paths": {\n    "/read_url": {\n      "post": {\n        "description": "Allows for reading the contents of an URL link, including PDF/DOC/DOCX/PPT/CSV/XLS/XLSX/HTML content, Google Drive, Dropbox, OneDrive, aidocmaker.com docs. Always wrap image URLs from the response field `z1_image_urls` in Markdown, where each image has a ## DESCRIPTION.",\n        "operationId": "ChatPDFReadRrl",\n        "requestBody": {\n          "content": {\n            "application/json": {\n              "schema": {\n                "$ref": "#/components/schemas/ReadDocV2Request"\n              }\n            }\n          },\n          "required": true\n        },\n        "responses": {\n          "200": {\n            "content": {\n              "application/json": {\n                "schema": {}\n              }\n            },\n            "description": "Successful Response"\n          },\n          "422": {\n            "content": {\n              "application/json": {\n                "schema": {\n                  "$ref": "#/components/schemas/HTTPValidationError"\n                }\n              }\n            },\n            "description": "Validation Error"\n          }\n        },\n        "summary": "Read the contents of an URL link",\n        "x-openai-isConsequential": false\n      }\n    }\n  },\n  "components": {\n    "schemas": {\n      "HTTPValidationError": {\n        "properties": {\n          "detail": {\n            "items": {\n              "$ref": "#/components/schemas/ValidationError"\n            },\n            "title": "Detail",\n            "type": "array"\n          }\n        },\n        "title": "HTTPValidationError",\n        "type": "object"\n      },\n      "ReadDocV2Request": {\n        "properties": {\n          "f1_http_url": {\n            "description": "User will pass a HTTPS or HTTP url to a file so that the file contents can be read.",\n            "title": "F1 Http Url",\n            "type": "string"\n          },\n          "f2_query": {\n            "default": "",\n            "description": "User will pass a query string to fetch relevant sections from the contents. It will be used for sentence-level similarity search on the document based on embeddings.",\n            "title": "F2 Query",\n            "type": "string"\n          },\n          "f3_selected_pages": {\n            "default": [],\n            "description": "Filter document on these page numbers. Use empty list to get all pages.",\n            "items": {\n              "type": "integer"\n            },\n            "title": "F3 Selected Pages",\n            "type": "array"\n          }\n        },\n        "required": [\n          "f1_http_url"\n        ],\n        "title": "ReadDocV2Request",\n        "type": "object"\n      },\n      "ValidationError": {\n        "properties": {\n          "loc": {\n            "items": {\n              "anyOf": [\n                {\n                  "type": "string"\n                },\n                {\n                  "type": "integer"\n                }\n              ]\n            },\n            "title": "Location",\n            "type": "array"\n          },\n          "msg": {\n            "title": "Message",\n            "type": "string"\n          },\n          "type": {\n            "title": "Error Type",\n            "type": "string"\n          }\n        },\n        "required": [\n          "loc",\n          "msg",\n          "type"\n        ],\n        "title": "ValidationError",\n        "type": "object"\n      }\n    }\n  }\n}',
    builtin: true,
    createdAt: 1726022138573,
    usingProxy: true,
  },
  "web-search": {
    id: "web-search",
    title: "Web Search",
    version: "v1.0.0",
    content:
      '{\n  "openapi": "3.1.0",\n  "info": {\n    "title": "Web Search",\n    "description": "a search engine. useful for when you need to answer questions about current events. input should be a search query.",\n    "version": "v1.0.0"\n  },\n  "servers": [\n    {\n      "url": "https://lite.duckduckgo.com"\n    }\n  ],\n  "paths": {\n    "/lite/": {\n      "post": {\n        "operationId": "DuckDuckGoLiteSearch",\n        "description": "a search engine. useful for when you need to answer questions about current events. input should be a search query.",\n        "deprecated": false,\n        "parameters": [\n          {\n            "name": "q",\n            "in": "query",\n            "required": true,\n            "description": "keywords for query.",\n            "schema": {\n              "type": "string"\n            }\n          },\n          {\n            "name": "s",\n            "in": "query",\n            "description": "can be `0`",\n            "schema": {\n              "type": "number"\n            }\n          },\n          {\n            "name": "o",\n            "in": "query",\n            "description": "can be `json`",\n            "schema": {\n              "type": "string"\n            }\n          },\n          {\n            "name": "api",\n            "in": "query",\n            "description": "can be `d.js`",\n            "schema": {\n              "type": "string"\n            }\n          },\n          {\n            "name": "kl",\n            "in": "query",\n            "description": "wt-wt, us-en, uk-en, ru-ru, etc. Defaults to `wt-wt`.",\n            "schema": {\n              "type": "string"\n            }\n          },\n          {\n            "name": "bing_market",\n            "in": "query",\n            "description": "wt-wt, us-en, uk-en, ru-ru, etc. Defaults to `wt-wt`.",\n            "schema": {\n              "type": "string"\n            }\n          }\n        ]\n      }\n    }\n  },\n  "components": {\n    "schemas": {}\n  }\n}',
    builtin: true,
    createdAt: 1726017447113,
    usingProxy: true,
    authType: "custom",
    authHeader: "key",
    authToken: "AIzaSyCqicv1MMWEZfj5jawETjVD8XSTDl7Lr3A",
    authLocation: "query",
  },
  calculator: {
    id: "calculator",
    title: "Calculator",
    version: "",
    content:
      '{\n  "openapi": "3.1.0",\n  "info": {\n\n    "title": "Calculator",\n    "description": "A wrapper around Wolfram Alpha. Useful for when you need to answer questions about Math, Science, Technology, Culture, Society and Everyday Life. Input should be a search query. If the result contains an image link, use the markdown syntax to return the image.",\n    "version": ""\n  },\n  "servers": [\n    {\n      "url": "https://www.wolframalpha.com"\n    }\n  ],\n  "paths": {\n    "/api/v1/llm-api": {\n      "get": {\n        "operationId": "Calculate",\n        "description": "A wrapper around Wolfram Alpha. Useful for when you need to answer questions about Math, Science, Technology, Culture, Society and Everyday Life. Input should be a search query. If the result contains an image link, use the markdown syntax to return the image.",\n        "deprecated": false,\n        "parameters": [\n          {\n            "name": "input",\n            "in": "query",\n            "required": true,\n            "description": "questions about Math, Science, Technology, Culture, Society and Everyday Life",\n            "schema": {\n              "type": "string"\n            }\n          }\n        ]\n      }\n    }\n  },\n  "components": {\n    "schemas": {}\n  }\n}',
    builtin: true,
    createdAt: 1725942223648,
    authType: "custom",
    authHeader: "appid",
    authToken: "X8PLWQ-W4WPTREX6G",
    usingProxy: true,
    authLocation: "query",
  },
  "web-browser": {
    id: "web-browser",
    title: "Web Browser",
    version: "v1.1",
    content:
      '{\n  "openapi": "3.0.1",\n  "info": {\n    "title": "Web Browser",\n    "description": "Start with a Request: Users can either directly request the \'longContentWriter\' to write a long form article or choose to use \'webPageReader\' for information gathering before content creation. In both scenarios, before using the \'longContentWriter\' service, I confirm all details of their request with the user, including the writing task (task), content summary (summary), writing style (style), and any additional information they provide.\\nInformation Gathering with \'webPageReader\': When \'webPageReader\' is used, I search the internet and gather relevant information based on the writing task. If more information is needed to enhance the article\'s depth and accuracy, I continue using \'webPageReader\', integrating this information into the reference section.\\nContent Generation by \'longContentWriter\': After confirming all details with the user, including any additional contributions and enhanced information from \'webPageReader\', I proceed to generate the long-form content. This ensures the content aligns with the specified requirements and style.\\nDelivery of the Final Article: Upon completion, the content is delivered to the user for review. They can request revisions or additional information if necessary.\\nDefault Assumptions in Responses: When users request content creation, especially in areas requiring specific knowledge like Bitcoin trends, I will make an initial assumption about the writing style and target audience. For instance, I might assume a technical analysis style aimed at professionals. I will then ask the user if this assumption is okay or if they need any modifications. This approach helps streamline the content creation process.",\n    "version": "v1.1"\n  },\n  "servers": [\n    {\n      "url": "https://gpts.webpilot.ai"\n    }\n  ],\n  "paths": {\n    "/api/read": {\n      "post": {\n        "operationId": "webPageReader",\n        "x-openai-isConsequential": false,\n        "summary": "visit web page",\n        "requestBody": {\n          "required": true,\n          "content": {\n            "application/json": {\n              "schema": {\n                "$ref": "#/components/schemas/visitWebPageRequest"\n              }\n            }\n          }\n        },\n        "responses": {\n          "200": {\n            "description": "OK",\n            "content": {\n              "application/json": {\n                "schema": {\n                  "$ref": "#/components/schemas/visitWebPageResponse"\n                }\n              }\n            }\n          },\n          "400": {\n            "description": "Bad Request",\n            "content": {\n              "application/json": {\n                "schema": {\n                  "$ref": "#/components/schemas/visitWebPageError"\n                }\n              }\n            }\n          }\n        }\n      }\n    },\n    "/api/write": {\n      "post": {\n        "operationId": "longContentWriter",\n        "x-openai-isConsequential": false,\n        "summary": "generate a book",\n        "requestBody": {\n          "required": true,\n          "content": {\n            "application/json": {\n              "schema": {\n                "$ref": "#/components/schemas/generateContentRequest"\n              }\n            }\n          }\n        },\n        "responses": {\n          "200": {\n            "description": "OK",\n            "content": {\n              "application/json": {\n                "schema": {\n                  "$ref": "#/components/schemas/generateContentResponse"\n                }\n              }\n            }\n          },\n          "400": {\n            "description": "Bad Request",\n            "content": {\n              "application/json": {\n                "schema": {\n                  "$ref": "#/components/schemas/generateContentError"\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  },\n  "components": {\n    "schemas": {\n      "generateContentRequest": {\n        "type": "object",\n        "required": [\n          "task",\n          "language",\n          "summary",\n          "style"\n        ],\n        "properties": {\n          "task": {\n            "type": "string",\n            "description": "The \\"task\\" field outlines the specific requirements and objectives for generating the content. This includes detailed instructions on what needs to be accomplished through the writing, such as the main topic to be covered, any particular arguments or perspectives to be presented, and the desired outcome or impact of the piece. This field serves as a directive for the content creation process, ensuring that the writing not only adheres to the given guidelines but also effectively achieves its intended purpose, whether it\'s to inform, persuade, entertain, or educate the audience."\n          },\n          "language": {\n            "type": "string",\n            "description": "Required, the language used by the user in the request, according to the ISO 639-1 standard. For Chinese, use zh-CN for Simplified Chinese and zh-TW for Traditional Chinese."\n          },\n          "summary": {\n            "type": "string",\n            "description": "The \\"summary\\" field encapsulates a concise overview of the writing content, presenting the core themes, key points, and primary objectives of the piece. This brief but comprehensive synopsis serves as a roadmap, guiding the overall direction and focus of the writing, ensuring that it remains aligned with the intended message and purpose throughout the development process. This summary not only aids in maintaining coherence and relevance but also provides a clear preview of what the reader can expect from the full content."\n          },\n          "reference": {\n            "type": "string",\n            "description": "The \\"reference\\" field is a curated collection of information sourced from the Internet via WebPilot, or proveded by the user, specifically tailored to enrich and support the writing task at hand. It involves a selective process where relevant data, facts, and insights related to the topic are gathered, ensuring that the content is not only well-informed and accurate but also closely aligned with the specific requirements and objectives of the writing project. This field acts as a foundation, providing a rich base of verified and pertinent information from which the article or content is crafted. This field would be long."\n          },\n          "style": {\n            "type": "string",\n            "description": "The \\"style\\" field in content creation is a detailed framework encompassing three pivotal components - the writing tone or style, the target audience, and the publication medium. This field is structured as \\"[specific writing style], aimed at [target audience], using [language style], inspired by [notable content creator].\\" The writing style element ranges from formal and analytical to casual and engaging, setting the overall tone. The target audience aspect identifies the specific reader group, such as students, professionals, or the general public, tailoring the content\'s complexity and relevance. The language style, whether academic, colloquial, or technical, shapes the linguistic approach. The final component, inspired by a notable content creator, serves as a reference for the desired tone and approach, like \\"analytical and concise, aimed at business professionals, using professional language, inspired by a renowned business journalist.\\" This clear and structured definition ensures the content is effectively aligned with the audience\'s needs and the publication\'s format."\n          }\n        }\n      },\n      "generateContentResponse": {\n        "type": "object",\n        "properties": {\n          "message": {\n            "type": "string",\n            "description": "Result message of the request"\n          }\n        }\n      },\n      "generateContentError": {\n        "type": "object",\n        "properties": {\n          "code": {\n            "type": "string",\n            "description": "error code"\n          },\n          "message": {\n            "type": "string",\n            "description": "error message"\n          },\n          "detail": {\n            "type": "string",\n            "description": "error detail"\n          }\n        }\n      },\n      "visitWebPageResponse": {\n        "type": "object",\n        "properties": {\n          "title": {\n            "type": "string",\n            "description": "The title of this web page"\n          },\n          "content": {\n            "type": "string",\n            "description": "The content of the web page\'s url to be summarized"\n          },\n          "meta": {\n            "type": "object",\n            "description": "The Html meta info of the web page"\n          },\n          "links": {\n            "type": "array",\n            "description": "Some links in the web page",\n            "items": {\n              "type": "string"\n            }\n          },\n          "extra_search_results": {\n            "type": "array",\n            "description": "Additional Search results",\n            "items": {\n              "type": "object",\n              "properties": {\n                "title": {\n                  "type": "string",\n                  "description": "the title of this search result"\n                },\n                "link": {\n                  "type": "string",\n                  "description": "the link of this search result"\n                },\n                "snippet": {\n                  "type": "string",\n                  "description": "the snippet of this search result"\n                }\n              }\n            }\n          },\n          "todo": {\n            "type": "array",\n            "description": "what to do with the content",\n            "items": {\n              "type": "string"\n            }\n          },\n          "tips": {\n            "type": "array",\n            "description": "Tips placed at the end of the answer",\n            "items": {\n              "type": "string"\n            }\n          },\n          "rules": {\n            "description": "Adherence is required when outputting content.",\n            "items": {\n              "type": "string"\n            }\n          }\n        }\n      },\n      "visitWebPageRequest": {\n        "type": "object",\n        "required": [\n          "link",\n          "ur"\n        ],\n        "properties": {\n          "link": {\n            "type": "string",\n            "description": "Required, The web page\'s url to visit and retrieve content from."\n          },\n          "ur": {\n            "type": "string",\n            "description": "Required, a clear statement of the user\'s request, can be used as a search query and may include search operators."\n          },\n          "lp": {\n            "type": "boolean",\n            "description": "Required, Whether the link is directly provided by the user"\n          },\n          "rt": {\n            "type": "boolean",\n            "description": "If the last request doesn\'t meet user\'s need, set this to true when trying to retry another request."\n          },\n          "l": {\n            "type": "string",\n            "description": "Required, the language used by the user in the request, according to the ISO 639-1 standard. For Chinese, use zh-CN for Simplified Chinese and zh-TW for Traditional Chinese."\n          }\n        }\n      },\n      "visitWebPageError": {\n        "type": "object",\n        "properties": {\n          "code": {\n            "type": "string",\n            "description": "error code"\n          },\n          "message": {\n            "type": "string",\n            "description": "error message"\n          },\n          "detail": {\n            "type": "string",\n            "description": "error detail"\n          }\n        }\n      }\n    }\n  }\n}\n',
    builtin: true,
    createdAt: 1725940572681,
    usingProxy: true,
    authType: "custom",
    authHeader: "WebPilot-Friend-UID",
    authToken: "flow-chat",
  },
} as Record<string, Plugin>;

export const DEFAULT_PLUGIN_STATE = {
  plugins: {} as Record<string, Plugin>,
};

export const usePluginStore = createPersistStore(
  { ...DEFAULT_PLUGIN_STATE },

  (set, get) => ({
    create(plugin?: Partial<Plugin>) {
      const plugins = this.getWithBuiltinPlugins();
      const id = nanoid();
      plugins[id] = {
        ...createEmptyPlugin(),
        ...plugin,
        id,
        builtin: false,
      };

      set(() => ({ plugins }));
      get().markUpdate();

      return plugins[id];
    },
    updatePlugin(id: string, updater: (plugin: Plugin) => void) {
      const plugins = this.getWithBuiltinPlugins();
      const plugin = plugins[id];
      if (!plugin) return;
      const updatePlugin = { ...plugin };
      updater(updatePlugin);
      plugins[id] = updatePlugin;
      FunctionToolService.add(updatePlugin, true);
      set(() => ({ plugins }));
      get().markUpdate();
    },
    delete(id: string) {
      const plugins = this.getWithBuiltinPlugins();
      delete plugins[id];
      set(() => ({ plugins }));
      get().markUpdate();
    },

    getAsTools(ids: string[]) {
      const plugins = this.getWithBuiltinPlugins();
      const selected = (ids || [])
        .map((id) => plugins[id])
        .filter((i) => i)
        .map((p) => FunctionToolService.add(p));
      return [
        // @ts-ignore
        selected.reduce((s, i) => s.concat(i.tools), []),
        selected.reduce((s, i) => Object.assign(s, i.funcs), {}),
      ];
    },
    get(id?: string) {
      return this.getWithBuiltinPlugins()[id ?? 1145141919810];
    },
    getAll() {
      return Object.values(this.getWithBuiltinPlugins()).sort(
        (a, b) => b.createdAt - a.createdAt,
      );
    },
    getWithBuiltinPlugins() {
      return {
        ...get().plugins,
        ...BUILLTIN_PLUGINS,
      };
    },
  }),
  {
    name: StoreKey.Plugin,
    version: 1,
  },
);
