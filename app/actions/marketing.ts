import { Action } from "../state/types";

export const GeneralAdCopy: Action = {
  name: "generalAdCopy",
  inputs: [
    {
      type: "text",
      id: "productName",
      label: "Product Name",
      placeholder: "Enter the name or type of the product",
      required: true,
    },
    {
      type: "text",
      id: "productUSP",
      label: "Unique Selling Proposition",
      placeholder: "What makes this product unique?",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Craft a compelling general ad copy for the product named '${payload.productName}' highlighting its unique selling proposition: '${payload.productUSP}'.`,
};

export const ClassifiedAd: Action = {
  name: "classifiedAd",
  inputs: [
    {
      type: "text",
      id: "productName",
      label: "Product Name",
      placeholder: "Enter the name or type of the product",
      required: true,
    },
    {
      type: "text",
      id: "productPrice",
      label: "Product Price",
      placeholder: "Enter the price of the product",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Create a concise classified ad for the product named '${payload.productName}' priced at '${payload.productPrice}'.`,
};

export const ProductSalesCopy: Action = {
  name: "productSalesCopy",
  inputs: [
    {
      type: "text",
      id: "productName",
      label: "Product Name",
      placeholder: "Enter the name or type of the product",
      required: true,
    },
    {
      type: "textArea",
      id: "productBenefits",
      label: "Product Benefits",
      placeholder: "List the main benefits of the product",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Write a persuasive sales copy for the product named '${payload.productName}' emphasizing its benefits: '${payload.productBenefits}'.`,
};

export const EmailSalesLetter: Action = {
  name: "emailSalesLetter",
  inputs: [
    {
      type: "text",
      id: "productName",
      label: "Product Name",
      placeholder: "Enter the name or type of the product",
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
    `Craft an engaging email sales letter promoting the product named '${payload.productName}' tailored for the target audience: '${payload.targetAudience}'.`,
};

export const ColdCallingScript: Action = {
  name: "coldCallingScript",
  inputs: [
    {
      type: "text",
      id: "productName",
      label: "Product Name",
      placeholder: "Enter the name or type of the product",
      required: true,
    },
    {
      type: "text",
      id: "companyName",
      label: "Your Company Name",
      placeholder: "Enter the name of your company",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Develop a cold calling script to promote the product named '${payload.productName}' on behalf of '${payload.companyName}'. Ensure the script is persuasive and addresses potential objections.`,
};

// call to action section with heading, subheading, body text, and button or opt-in form
const CallToActionSection: Action = {
  name: "callToActionSection",
  inputs: [
    {
      type: "text",
      id: "heading",
      label: "Heading",
      placeholder: "Enter the heading for the call to action section",
      required: true,
    },
    {
      type: "textArea",
      id: "bodyText",
      label: "Body Description",
      placeholder: "Describe the product or service being offered",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Create a call to action section for a webpage using the following details: 'Elicited action: ${payload.heading}' 'Action reward: ${payload.bodyText}'. Include a heading, subheading, body text and button text and return html doc with css and js embedded.'.`,
};

// landing page with heading, subheading, body text, and button or opt-in form
// sales page with heading, subheading, body text, and button or opt-in form

export default {
  generalAdCopy: GeneralAdCopy,
  classifiedAd: ClassifiedAd,
  productSalesCopy: ProductSalesCopy,
  emailSalesLetter: EmailSalesLetter,
  coldCallingScript: ColdCallingScript,
  callToActionSection: CallToActionSection,
};
