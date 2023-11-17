import { NextResponse } from "next/server";

async function handle() {
  // hello world
  return NextResponse.json({
    hello: "world",
  });
}

export const POST = handle;

export const runtime = "edge";
