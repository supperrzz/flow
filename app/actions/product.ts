import { Action } from "../state/types";

export const ProductTitle: Action = {
  name: "productTitle",
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
      id: "productFeature",
      label: "Key Feature",
      placeholder: "Enter a key feature or selling point of the product",
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Craft a compelling title for the product named '${payload.productName}' with the feature '${payload.productFeature}'.`,
};

export const ProductDescription: Action = {
  name: "productDescription",
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
      id: "productFeatures",
      label: "Product Features",
      placeholder: "List the main features or specifications of the product",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Write a detailed description for the product named '${payload.productName}' highlighting its features: '${payload.productFeatures}'.`,
};

export const ProductBenefits: Action = {
  name: "productBenefits",
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
      id: "productFeatures",
      label: "Product Features",
      placeholder: "List the main features or specifications of the product",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `List the key benefits of the product named '${payload.productName}' based on its features: '${payload.productFeatures}'.`,
};

export const ProductBulletPoints: Action = {
  name: "productBulletPoints",
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
      id: "productDescription",
      label: "Product Description",
      placeholder: "Provide a brief description of the product",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Create concise bullet points highlighting the main features and benefits of the product named '${payload.productName}' based on its description: '${payload.productDescription}'.`,
};

export const ProductReview: Action = {
  name: "productReview",
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
      id: "userExperience",
      label: "User Experience",
      placeholder: "Describe the user's experience with the product",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Write a genuine review for the product named '${payload.productName}' based on the user experience: '${payload.userExperience}'.`,
};

export default {
  productTitle: ProductTitle,
  productDescription: ProductDescription,
  productBenefits: ProductBenefits,
  productBulletPoints: ProductBulletPoints,
  productReview: ProductReview,
};
