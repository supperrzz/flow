import { Action } from "../state/types";

export const BrandMission: Action = {
  name: "brandMission",
  inputs: [
    {
      type: "text",
      id: "brandName",
      label: "Brand Name",
      placeholder: "Enter the name of the brand",
      required: true,
    },
    {
      type: "textArea",
      id: "brandValues",
      label: "Describe your product or service",
      placeholder:
        "List the core values of the brand (e.g., Innovation, Sustainability, Luxury)",
      required: true,
    },
    {
      type: "text",
      id: "targetAudience",
      label: "Target Audience",
      placeholder: "Describe the primary audience or customer base",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Craft a mission statement for ${payload.brandName}. The mission should reflect the brand description: ${payload.brandValues}. It should resonate with its target audience, ${payload.targetAudience} and be written in`,
  tone: true,
};

// export const ValueProposition: Action = {
//   name: "valueProposition",
//   inputs: [
//     {
//       type: "text",
//       id: "brandName",
//       label: "Brand Name",
//       placeholder: "Enter the name of the brand",
//       required: true,
//     },
//     {
//       type: "textArea",
//       id: "brandValues",
//       label: "Describe your product or service",
//       placeholder:
//         "List the core values of the brand (e.g., Innovation, Sustainability, Luxury)",
//       required: true,
//     },
//     {
//       type: "text",
//       id: "targetAudience",
//       label: "Target Audience",
//       placeholder: "Describe the primary audience or customer base",
//       required: true,
//     },
//   ],
//   prompt: (payload: Record<string, string>) =>
//     `Craft a compelling value proposition for ${payload.brandName}. Highlight its key features: ${payload.brandValues}. The proposition should resonate with its target audience: ${payload.targetAudience} and be written in`,
//   tone: true,
// };

export const PitchDeck: Action = {
  name: "pitchDeck",
  inputs: [
    {
      type: "text",
      id: "brandName",
      label: "Brand Name",
      placeholder: "Enter the name of the brand you're pitching",
      required: true,
    },
    {
      type: "textArea",
      id: "productDescription",
      label: "Product/Service Description",
      placeholder: "Provide a brief description of the product or service",
      required: true,
    },
    {
      type: "text",
      id: "keyBenefits",
      label: "Key Benefits",
      placeholder:
        "List the main benefits or advantages of the product/service",
      required: true,
    },
    {
      type: "textArea",
      id: "targetMarket",
      label: "Target Market",
      placeholder:
        "Describe the primary audience or customer base for the product/service",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Create a structured pitch deck template for the brand titled '${payload.brandName}'. The deck should cover:

    1. Engaging Hook
    2. The Problem
    3. The Solution
    4. Unique Selling Proposition (USP)
    5. Market Opportunity
    6. Business Model
    7. Go-to-Market Strategy
    8. Competitive Landscape
    9. Traction & Milestones
    10. Financial Projections
    11. The Team
    12. Vision & Future
    13. Call to Action

    Please fill in each slide with appropriate content and visuals, considering the product description '${payload.productDescription}', key benefits '${payload.keyBenefits}', and target market '${payload.targetMarket}'.`,
};

export const SloganGenerator: Action = {
  name: "sloganGenerator",
  inputs: [
    {
      type: "text",
      id: "brandName",
      label: "Brand Name",
      placeholder: "Enter the name of the brand",
      required: true,
    },
    {
      type: "textArea",
      id: "brandValues",
      label: "Brand Values",
      placeholder:
        "List the core values of the brand (e.g., Innovation, Sustainability, Luxury)",
      required: true,
    },
    {
      type: "select",
      id: "industry",
      label: "Industry",
      placeholder: "Select the industry for the business idea",
      options: [
        "Tech",
        "Fashion",
        "Food",
        "Healthcare",
        "Entertainment",
        "E-commerce",
        "Education",
        "Other",
      ],
      required: true,
    },
    {
      type: "text",
      id: "targetAudience",
      label: "Target Audience",
      placeholder: "Describe the primary audience or customer base",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Craft a catchy and memorable slogan for ${payload.brandName}, a brand in the ${payload.industry} industry. The slogan should reflect its core values: ${payload.brandValues} and resonate with its target audience: ${payload.targetAudience}.`,
};

export const BrainstormIdeas: Action = {
  name: "brainstormIdeas",
  inputs: [
    {
      type: "text",
      id: "topicOne",
      label: "Topic 1",
      placeholder: "Enter a topic to base the business idea on",
      required: true,
    },
    {
      type: "text",
      id: "topicTwo",
      label: "Topic 2",
      placeholder: "Enter a topic to base the business idea on",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Brainstorm 3 innovative business ideas for that intersect these two themes: '${payload.topicOne}', '${payload.topicTwo}' ensuring they are unique, feasible, and address a clear need or gap in the market.`,
};

const WebPageCopy: Action = {
  name: "webPageCopy",
  inputs: [
    {
      type: "text",
      id: "websiteName",
      label: "Website Name",
      placeholder: "Enter the name of the website",
      required: true,
    },
    {
      type: "textArea",
      id: "websiteDescription",
      label: "Website Description",
      placeholder:
        "Describe the purpose of the website and what it will be used for",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Generate copy for a single page website. The website should be called ${payload.websiteName} and should be used for ${payload.websiteDescription}. The copy should be written in`,
  tone: true,
};

const ACTIONS = {
  brainstormIdeas: BrainstormIdeas,
  brandMission: BrandMission,
  // valueProposition: ValueProposition,
  pitchDeck: PitchDeck,
  // sloganGenerator: SloganGenerator,
  webPageCopy: WebPageCopy,
};

export default ACTIONS;
