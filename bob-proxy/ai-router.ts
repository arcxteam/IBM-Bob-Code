import { NextRequest, NextResponse } from "next/server";
import { callWatsonx } from "@/lib/watsonx";

const BOB_PROXY_URL = process.env.BOB_PROXY_URL || "";

interface ModuleConfig {
  systemPrompt: string;
  temperature: number;
  maxNewTokens: number;
  bobChatMode: "advanced" | "code" | "ask";
}

const MODULE_CONFIGS: Record<string, ModuleConfig> = {
  analyze: {
    systemPrompt: "You are a code architecture analyzer. Analyze the given code and return structured JSON with files, dependencies, architecture, complexity, and suggestions.",
    temperature: 0.1,
    maxNewTokens: 2000,
    bobChatMode: "advanced",
  },
  chat: {
    systemPrompt: "You are a code flow tracer. Help developers understand how code flows work across files. Explain in markdown.",
    temperature: 0.3,
    maxNewTokens: 1500,
    bobChatMode: "advanced",
  },
  refactor: {
    systemPrompt: "You are a code refactorer. Find anti-patterns, code smells, and suggest improvements. Return JSON array of suggestions.",
    temperature: 0.1,
    maxNewTokens: 2000,
    bobChatMode: "advanced",
  },
  generate: {
    systemPrompt: "You are a documentation and test generator. Generate comprehensive docs and tests for the given code.",
    temperature: 0.4,
    maxNewTokens: 3000,
    bobChatMode: "advanced",
  },
  security: {
    systemPrompt: "You are a security scanner. Find vulnerabilities including OWASP Top 10. Return JSON with findings and score.",
    temperature: 0.05,
    maxNewTokens: 2000,
    bobChatMode: "advanced",
  },
};

export async function aiInference(
  module: string,
  userContent: string,
  messages?: { role: string; content: string }[]
): Promise<{ result: string; source: "bob" | "watsonx" }> {
  const config = MODULE_CONFIGS[module];
  if (!config) {
    throw new Error(`Unknown module: ${module}`);
  }

  // Try Bob Shell proxy first
  if (BOB_PROXY_URL) {
    try {
      const bobPrompt = `${config.systemPrompt}\n\n${userContent}`;
      const res = await fetch(`${BOB_PROXY_URL}/api/bob`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: bobPrompt,
          chatMode: config.bobChatMode,
          maxCoins: 3,
        }),
        signal: AbortSignal.timeout(90000),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.output) {
          return { result: data.output, source: "bob" };
        }
      }
    } catch {
      // Bob proxy failed, fall through to watsonx
    }
  }

  // Fallback: direct watsonx.ai inference
  const systemMessage = { role: "system" as const, content: config.systemPrompt };
  const userMessage = { role: "user" as const, content: userContent };

  const allMessages = messages
    ? ([systemMessage, ...messages] as { role: "system" | "user" | "assistant"; content: string }[])
    : ([systemMessage, userMessage] as { role: "system" | "user" | "assistant"; content: string }[]);

  const result = await callWatsonx(allMessages, {
    temperature: config.temperature,
    maxNewTokens: config.maxNewTokens,
  });

  return { result, source: "watsonx" };
}
