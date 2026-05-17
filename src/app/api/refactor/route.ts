import { NextRequest, NextResponse } from 'next/server'
import { analyzeWithWatsonx, extractJSON } from '@/lib/watsonx'
import { callBobProxy } from '@/lib/bob-proxy'

interface RefactorSuggestion {
  id: string;
  type: 'pattern' | 'boilerplate' | 'migration' | 'optimization';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  code: string;
  suggestion: string;
  file: string;
  line: number;
}

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    const systemPrompt = `You are an expert code refactoring specialist and modernization engineer. Analyze the provided code for outdated patterns, code smells, deprecated APIs, and improvement opportunities.

Respond with ONLY a valid JSON array of refactoring suggestions. No markdown, no explanation, no code fences.

Each suggestion object must have:
{
  "id": "unique string id",
  "type": "pattern" | "boilerplate" | "migration" | "optimization",
  "title": "short title",
  "description": "what the problem is",
  "severity": "low" | "medium" | "high" | "critical",
  "code": "the problematic code snippet",
  "suggestion": "the improved/fixed version",
  "file": "filename where issue was found",
  "line": estimated line number as integer
}

Patterns to detect (in order of severity):
- CRITICAL: Security vulnerabilities in code patterns, eval(), SQL concatenation
- HIGH: var declarations (should be const/let), callback hell, XMLHttpRequest usage
- HIGH: Missing error handling, unhandled promise rejections
- MEDIUM: Magic numbers without named constants, deeply nested conditionals
- MEDIUM: Long functions (>50 lines), duplicated code blocks
- LOW: Missing TypeScript types, implicit any, missing JSDoc
- LOW: Inefficient loops, unnecessary re-renders in React

Provide between 3 and 10 suggestions based on what you find.`

    // Try Bob Shell proxy first, then fallback to direct watsonx.ai
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

    const parsed = extractJSON<RefactorSuggestion[]>(raw)

    if (parsed && Array.isArray(parsed) && parsed.length > 0) {
      return NextResponse.json({ suggestions: parsed })
    }

    const fallback: RefactorSuggestion[] = [
      { id: 'R-001', type: 'pattern', title: 'Consider using const/let instead of var', description: 'var declarations are function-scoped and can lead to unexpected behavior.', severity: 'high', code: 'var x = ...', suggestion: 'const x = ...', file: 'main', line: 1 },
      { id: 'R-002', type: 'optimization', title: 'Add error handling for async operations', description: 'Unhandled promise rejections can crash the application.', severity: 'high', code: 'await fetch(...)', suggestion: 'try { await fetch(...) } catch(e) { ... }', file: 'main', line: 1 },
      { id: 'R-003', type: 'pattern', title: 'Use optional chaining for nested property access', description: 'Prevents runtime errors from undefined nested properties.', severity: 'medium', code: 'obj.prop.nested', suggestion: 'obj?.prop?.nested', file: 'main', line: 1 },
      { id: 'R-004', type: 'boilerplate', title: 'Extract repeated logic into utility functions', description: 'Duplicated code increases maintenance burden.', severity: 'medium', code: 'repeated logic block', suggestion: 'extracted utility function', file: 'main', line: 1 },
      { id: 'R-005', type: 'migration', title: 'Add TypeScript type annotations', description: 'Type safety catches bugs at compile time.', severity: 'low', code: 'function handler(req)', suggestion: 'function handler(req: Request): Promise<Response>', file: 'main', line: 1 },
    ]
    return NextResponse.json({ suggestions: fallback })
  } catch (error) {
    console.error('Refactor error:', error)
    return NextResponse.json({ error: 'Failed to analyze code' }, { status: 500 })
  }
}
