import { renderPrompt } from "@/app/utils-2";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import Locale from "../../locales";
import { countTokens, updateUsage, usageLimitCheck } from "@/app/utils/usage";

const openai = new OpenAI();

async function handle(req: NextRequest) {
  // Parse the JSON body from the request
  const { key, payload, tone } = await req.json();

  let prompt = renderPrompt(key, payload, tone);
  const systemPrompt = `
    dont start your response with a new line
  `;
  prompt = prompt + systemPrompt;

  const moderation = await openai.moderations.create({
    input: prompt,
  });

  console.log("[moderation check]: ", moderation.results[0].flagged);
  if (moderation.results[0].flagged) {
    // return error
    return NextResponse.error();
  }

  const usageLimit = await usageLimitCheck(payload.userId, payload.userEmail);
  console.log("[usage limit check]: ", usageLimit);

  if (usageLimit === false) {
    // return error message with usage limit and not authorized code
    return NextResponse.json({
      code: 401,
      result: Locale.Error.UsageLimit,
    });
  }

  const response = await openai.completions.create({
    model: "text-davinci-003",
    prompt,
    temperature: 0.85,
    max_tokens: 2000,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  let data = response.choices?.[0]?.text;

  if (data) {
    const error = await updateUsage(payload.userId, countTokens(data));
    if (error) {
      console.error("[update usage error]: ", error);
    }
    // remove new line at the beginning of the response
    const firstNewLineIndex = data.indexOf("\n");
    if (firstNewLineIndex === 0) {
      data = data.slice(1);
    }
  }

  if (data === undefined) throw new Error("No suggestion found");

  // Respond with a JSON object that includes the parsed parameters
  return NextResponse.json({
    moderation,
    params: { key, payload, tone },
    result: data,
  });
}

export const POST = handle;

export const runtime = "edge";
