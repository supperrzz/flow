import { renderPrompt } from "@/app/utils-2";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import Locale from "../../locales";
import { updateUsage, usageLimitCheck } from "@/app/utils/usage";

import { OpenAIStream, OpenAIStreamPayload } from "./OpenAIStream";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

const handle = async (req: Request): Promise<Response> => {
  // Parse the JSON body from the request
  const { key, payload, tone } = await req.json();

  const usageLimit = await usageLimitCheck(payload.userId, payload.userEmail);
  console.log("[usage limit check]: ", usageLimit);

  if (usageLimit === false) {
    // return error message with usage limit and not authorized code
    return NextResponse.json({
      code: 401,
      result: Locale.Error.UsageLimit,
    });
  }

  const prompt = renderPrompt(key, payload, tone);
  if (!prompt) {
    return new Response("No prompt in the request", { status: 400 });
  }

  console.log("[prompt]: ", prompt);
  const reqPayload: OpenAIStreamPayload = {
    model: "gpt-4o",
    messages: [
      { role: "system", content: "Always return your response in markdown" },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 2000,
    stream: true,
    n: 1,
  };

  const stream = await OpenAIStream(reqPayload);
  // return stream response (SSE)
  return new Response(stream, {
    headers: new Headers({
      // since we don't use browser's EventSource interface, specifying content-type is optional.
      // the eventsource-parser library can handle the stream response as SSE, as long as the data format complies with SSE:
      // https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#sending_events_from_the_server

      // 'Content-Type': 'text/event-stream',
      "Cache-Control": "no-cache",
    }),
  });
};

export const runtime = "edge";
export const POST = handle;
