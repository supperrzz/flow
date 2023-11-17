import { Action } from "../state/types";

export const BrandName: Action = {
  name: "brandName",
  inputs: [
    {
      type: "select",
      id: "industry",
      label: "Industry",
      placeholder: "Select the industry of the brand",
      options: [
        "Tech",
        "Fashion",
        "Food",
        "Healthcare",
        "Entertainment",
        "Other",
      ],
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
      id: "brandType",
      label: "Brand Type",
      placeholder: "Select the type of brand",
      options: ["Product", "Service", "Platform", "Community", "Other"],
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Generate a brand name for a ${payload.industry} ${payload.brandType} that embodies the core values of ${payload.brandValues}. Consider uniqueness, memorability, and relevance to the intended audience. brand name: `,
};

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
      label: "Brand Values",
      placeholder:
        "List the core values of the brand (e.g., Innovation, Sustainability, Luxury)",
      required: true,
    },
    {
      type: "select",
      id: "industry",
      label: "Industry",
      placeholder: "Select the industry of the brand",
      options: [
        "Tech",
        "Fashion",
        "Food",
        "Healthcare",
        "Entertainment",
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
    `Craft a mission statement for ${payload.brandName}, a brand in the ${payload.industry} industry. The mission should reflect its core values: ${payload.brandValues}. It should resonate with its target audience, ${payload.targetAudience} and be written in`,
  tone: true,
};

export const ValueProposition: Action = {
  name: "valueProposition",
  inputs: [
    {
      type: "text",
      id: "productName",
      label: "Product/Service Name",
      placeholder: "Enter the name of the product or service",
      required: true,
    },
    {
      type: "textArea",
      id: "keyFeatures",
      label: "Key Features",
      placeholder:
        "List the main features or benefits (e.g., Fast, Durable, User-friendly)",
      required: true,
    },
    {
      type: "text",
      id: "targetAudience",
      label: "Target Audience",
      placeholder: "Describe the primary audience or customer base",
      required: true,
    },
    {
      type: "select",
      id: "industry",
      label: "Industry",
      placeholder: "Select the industry of the product/service",
      options: [
        "Tech",
        "Fashion",
        "Food",
        "Healthcare",
        "Entertainment",
        "Other",
      ],
      required: true,
    },
    {
      type: "textArea",
      id: "competitiveAdvantage",
      label: "Competitive Advantage",
      placeholder:
        "Describe what sets this product/service apart from competitors",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Craft a compelling value proposition for ${payload.productName}, a ${payload.industry} product/service. Highlight its key features: ${payload.keyFeatures}. The proposition should emphasize its competitive advantage: ${payload.competitiveAdvantage}, and resonate with its target audience: ${payload.targetAudience} and be written in`,
  tone: true,
};

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
    {
      type: "text",
      id: "topicOne",
      label: "Topic 1",
      placeholder: "Enter the first topic to base the business idea on",
      required: true,
    },
    {
      type: "text",
      id: "topicTwo",
      label: "Topic 2",
      placeholder: "Enter the second topic to base the business idea on",
      required: true,
    },
    {
      type: "select",
      id: "businessType",
      label: "Business Type",
      placeholder: "Select the type of business",
      options: ["Product", "Service", "Platform", "Community", "Other"],
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Brainstorm 3 innovative business ideas for the ${payload.industry} industry, specifically focusing on ${payload.businessType}. Consider the target audience: ${payload.targetAudience}. Generate ideas that intersect the themes of '${payload.topicOne}' and '${payload.topicTwo}', ensuring they are unique, feasible, and address a clear need or gap in the market.`,
};

//Make a single page website that shows off different neat javascript features for drop-downs and things to display information. The website should be an HTML file with embedded javascript and CSS.

const SinglePageWebsite: Action = {
  name: "singlePageWebsite",
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
    `Make a single page website. The website should be called ${payload.websiteName} and should be used for ${payload.websiteDescription}. The website should be an HTML file with embedded javascript and CSS.`,
  tone: true,
};

const ACTIONS = {
  brainstormIdeas: BrainstormIdeas,
  brandName: BrandName,
  brandMission: BrandMission,
  valueProposition: ValueProposition,
  pitchDeck: PitchDeck,
  sloganGenerator: SloganGenerator,
  singlePageWebsite: SinglePageWebsite,
};

export default ACTIONS;
