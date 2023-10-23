/* eslint-disable @next/next/no-page-custom-font */
import "./styles/globals.scss";
import "./styles/markdown.scss";
import "./styles/highlight.scss";
import { getClientConfig } from "./config/client";
import { type Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Flow: AI-Powered Chat Application for Business & Personal Life",
  description:
    "Flow is a state-of-the-art, AI-powered chat application designed for both business and personal use. Seamlessly integrating advanced generative language models, Flow enhances communication, collaboration, and productivity.",
  keywords:
    "AI, Chat Application, Business, Personal, Generative Language Model, Communication, Collaboration, Productivity",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#151515" },
  ],
  appleWebApp: {
    title: "Flow: AI-Powered Chat Application for Business & Personal Life",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="config" content={JSON.stringify(getClientConfig())} />
        <link rel="manifest" href="/site.webmanifest"></link>
        <script src="/serviceWorkerRegister.js" defer></script>
      </head>
      <body>{children}</body>
      <Analytics />
    </html>
  );
}
