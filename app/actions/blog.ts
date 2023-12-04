import { Action } from "../state/types";

export const BlogPostIdeas: Action = {
  name: "blogPostIdeas",
  inputs: [
    {
      type: "text",
      id: "niche",
      label: "Niche or Keyword",
      placeholder: "Enter a niche or keyword",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Generate a list of potential blog post topics based on the niche or keyword '${payload.niche}'.`,
};

export const BlogOutlineBuilder: Action = {
  name: "blogOutlineBuilder",
  inputs: [
    {
      type: "text",
      id: "blogTopic",
      label: "Blog Post Topic",
      placeholder: "Enter the topic of the blog post",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Create a structured outline for the blog post topic '${payload.blogTopic}', ensuring all key points are covered.`,
};

export const KeywordSuggestion: Action = {
  name: "keywordSuggestion",
  inputs: [
    {
      type: "text",
      id: "blogTopic",
      label: "Blog Post Topic",
      placeholder: "Enter the topic of the blog post",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Suggest relevant SEO keywords for the blog post topic '${payload.blogTopic}'.`,
};

export const CallToAction: Action = {
  name: "callToAction",
  inputs: [
    {
      type: "text",
      id: "blogTopic",
      label: "Blog Post Topic",
      placeholder: "Enter the topic of the blog post",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Craft compelling CTAs for the blog post topic '${payload.blogTopic}' to encourage reader actions.`,
};

export const BlogPostReviewer: Action = {
  name: "blogPostReviewer",
  inputs: [
    {
      type: "textArea",
      id: "blogContent",
      label: "Blog Post Content",
      placeholder: "Paste the content of the blog post",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Analyze the provided blog post content and provide suggestions for improvement.`,
};

export const BlogPost: Action = {
  name: "blogPost",
  inputs: [
    {
      type: "text",
      id: "blogTopic",
      label: "Blog Post Topic",
      placeholder: "Enter the topic of the blog post",
      required: true,
    },
    {
      type: "text",
      id: "targetKeywords",
      label: "Target Keywords",
      placeholder: "List the main SEO keywords for the post",
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Generate a full SEO-optimized blog post on the topic '${payload.blogTopic}', incorporating the target keywords '${payload.targetKeywords}'. Ensure the content is engaging, informative, and structured for readability.`,
};

export const SeoMetaData: Action = {
  name: "seoMetaData",
  inputs: [
    {
      type: "text",
      id: "blogTopic",
      label: "Blog Post Topic",
      placeholder: "Enter the topic of the blog post",
      required: true,
    },
    {
      type: "text",
      id: "targetKeywords",
      label: "Target Keywords",
      placeholder: "List the main SEO keywords for the post",
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Generate SEO-optimized meta title and description for the blog post on the topic '${payload.blogTopic}', incorporating the target keywords '${payload.targetKeywords}'.`,
};

export default {
  blogPostIdeas: BlogPostIdeas,
  blogPost: BlogPost,
  // keywordSuggestion: KeywordSuggestion,
  callToAction: CallToAction,
  seoMetaData: SeoMetaData,
};
