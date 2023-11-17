export type Action = {
  name: string;
  inputs: PromptInput[];
  prompt: (payload: Record<string, string>) => string;
  tone?: boolean;
};

export type PromptInput = {
  id: string;
  type: "text" | "textArea" | "select";
  label: string;
  placeholder: string;
  options?: string[];
  required?: boolean;
};
