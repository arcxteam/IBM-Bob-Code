import { NextRequest, NextResponse } from 'next/server'
import { analyzeWithWatsonx, extractJSON, type WatsonxMessage } from '@/lib/watsonx'
import { callBobProxy } from '@/lib/bob-proxy'

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    const systemPrompt = `You are an expert code architecture analyst with deep knowledge of software design patterns, dependency graphs, and code quality metrics. Analyze the provided code and respond with ONLY a valid JSON object. No markdown, no explanation, no code fences — pure JSON only.

The JSON must have this exact structure:
{
  "files": [{ "name": string, "language": string, "lines": number, "complexity": number, "functions": string[] }],
  "dependencies": string[],
  "architecture": string,
  "complexity": number,
  "suggestions": string[]
}

Rules:
- files: extract all detected files/modules with their language, estimated line count, complexity (1-10), and function names
- dependencies: list all imported packages and inter-module dependencies
- architecture: 1-2 sentence description of the overall design pattern (MVC, microservices, monolith, etc.)
- complexity: overall complexity score 1-10
- suggestions: exactly 5 actionable improvement recommendations`

    let raw: string

    const bobResult = await callBobProxy(
      `${systemPrompt}\n\n${code}`,
      { chatMode: "advanced", maxCoins: 3 }
    )

    if (bobResult.success && bobResult.output) {
      raw = bobResult.output
    } else {
      raw = await analyzeWithWatsonx(systemPrompt, code, {
        temperature: 0.1,
        maxNewTokens: 2000,
      })
    }

    const parsed = extractJSON<{
      files: Array<{ name: string; language: string; lines: number; complexity: number; functions: string[] }>;
      dependencies: string[];
      architecture: string;
      complexity: number;
      suggestions: string[];
    }>(raw)

    if (parsed && parsed.files) {
      return NextResponse.json(parsed)
    }

    const fallback = {
      files: [{ name: 'main.ts', language: 'TypeScript', lines: code.split('\n').length, complexity: 5, functions: [] }],
      dependencies: [],
      architecture: 'Unable to determine architecture. Please try with more complete code.',
      complexity: 5,
      suggestions: [
        'Add TypeScript strict mode',
        'Implement error boundaries',
        'Add unit tests',
        'Document public APIs with JSDoc',
        'Consider extracting reusable utilities',
      ],
    }
    return NextResponse.json(fallback)
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json({ error: 'Failed to analyze code' }, { status: 500 })
  }
}
