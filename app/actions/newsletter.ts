import { Action } from "../state/types";

export const NewsletterIdeas: Action = {
  name: "newsletterIdeas",
  inputs: [
    {
      type: "text",
      id: "topic",
      label: "Topic or Theme",
      placeholder: "Enter the main topic or theme for the newsletter",
      required: true,
    },
    {
      type: "text",
      id: "targetAudience",
      label: "Target Audience",
      placeholder: "Describe the primary audience for the newsletter",
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Generate a list of engaging newsletter ideas centered around the topic '${payload.topic}' for the target audience: '${payload.targetAudience}'.`,
};

export const NewsletterHeadlines: Action = {
  name: "newsletterHeadlines",
  inputs: [
    {
      type: "text",
      id: "keyContent",
      label: "Key Content",
      placeholder: "Describe the main content or highlight of the newsletter",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Craft compelling headlines that capture the essence of the key content: '${payload.keyContent}'.`,
};

export const NewsletterBody: Action = {
  name: "newsletterBody",
  inputs: [
    {
      type: "text",
      id: "headline",
      label: "Selected Headline",
      placeholder: "Enter the chosen headline for the newsletter",
      required: true,
    },
    {
      type: "textArea",
      id: "contentOutline",
      label: "Content Outline",
      placeholder:
        "Provide a brief outline or points to cover in the newsletter body",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Compose the body of the newsletter based on the headline '${payload.headline}' and the provided content outline: '${payload.contentOutline}'.`,
};

export const Newsletter: Action = {
  name: "newsletter",
  inputs: [
    {
      type: "text",
      id: "topic",
      label: "Topic or Theme",
      placeholder: "Enter the main topic or theme for the newsletter",
      required: true,
    },
    {
      type: "text",
      id: "targetAudience",
      label: "Target Audience",
      placeholder: "Describe the primary audience for the newsletter",
    },
    {
      type: "text",
      id: "keyContent",
      label: "Key Content",
      placeholder: "Describe the main content or highlight of the newsletter",
      required: true,
    },
    {
      type: "text",
      id: "headline",
      label: "Selected Headline",
      placeholder: "Enter the chosen headline for the newsletter",
      required: true,
    },
    {
      type: "textArea",
      id: "contentOutline",
      label: "Content Outline",
      placeholder:
        "Provide a brief outline or points to cover in the newsletter body",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Generate a list of engaging newsletter ideas centered around the topic '${payload.topic}' for the target audience: '${payload.targetAudience}'. Then, craft compelling headlines that capture the essence of the key content: '${payload.keyContent}'. Finally, compose the body of the newsletter based on the headline '${payload.headline}' and the provided content outline: '${payload.contentOutline}'.`,
};

export default {
  newsletterIdeas: NewsletterIdeas,
  newsletter: Newsletter,
  // newsletterHeadlines: NewsletterHeadlines,
  // newsletterBody: NewsletterBody,
};
