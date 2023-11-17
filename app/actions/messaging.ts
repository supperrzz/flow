import { Action } from "../state/types";

export const EmailGenerator: Action = {
  name: "emailGenerator",
  inputs: [
    {
      type: "select",
      id: "emailType",
      label: "Email Type",
      options: [
        "Welcome Email",
        "Thank You Email",
        "Confirmation Email",
        "Follow Up Email",
        "Coupon/Discount Email",
        "Cancellation Email",
        "Clickbait (Outreach email)",
      ],
      placeholder: "Select the type of email to generate",
      required: true,
    },
    {
      type: "text",
      id: "recipientName",
      label: "Recipient's Name",
      placeholder: "Enter the name of the email recipient",
    },
    {
      type: "text",
      id: "companyName",
      label: "Your Company Name",
      placeholder: "Enter the name of your company",
    },
    {
      type: "textArea",
      id: "additionalInfo",
      label: "Additional Information",
      placeholder:
        "Provide any additional information or context relevant to the email type selected",
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Generate a '${payload.emailType}' for recipient '${payload.recipientName}' from company '${payload.companyName}'. Consider any additional context provided: '${payload.additionalInfo}'.`,
};

export const SMSMessage: Action = {
  name: "smsMessage",
  inputs: [
    {
      type: "text",
      id: "recipientName",
      label: "Recipient's Name",
      placeholder: "Enter the name of the message recipient",
    },
    {
      type: "text",
      id: "companyName",
      label: "Your Company Name",
      placeholder: "Enter the name of your company",
    },
    {
      type: "textArea",
      id: "messagePurpose",
      label: "Purpose of the Message",
      placeholder: "Describe the main purpose or context of the SMS message",
      required: true,
    },
  ],
  prompt: (payload: Record<string, string>) =>
    `Craft an SMS message for recipient '${payload.recipientName}' from company '${payload.companyName}' with the purpose: '${payload.messagePurpose}'.`,
};

export default {
  emailGenerator: EmailGenerator,
  smsMessage: SMSMessage,
};
