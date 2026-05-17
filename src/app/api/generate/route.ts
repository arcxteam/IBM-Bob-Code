import { NextRequest, NextResponse } from 'next/server'
import { analyzeWithWatsonx } from '@/lib/watsonx'

const typePrompts: Record<string, string> = {
  readme: `You are a technical documentation expert. Generate a comprehensive, production-ready README.md for the provided code. Include: project overview, features, installation, usage, API reference (if applicable), architecture, and license section. Use proper markdown formatting with headers, code blocks, and tables where appropriate. Make it professional and complete.`,

  'api-doc': `You are an API documentation specialist. Generate comprehensive API documentation for the provided code. Include: endpoint descriptions, request/response schemas with examples, status codes, error responses, and usage examples. Use clear markdown with tables and code blocks.`,

  test: `You are a test engineering expert specializing in Vitest and TypeScript. Generate a comprehensive test suite for the provided code. Include: unit tests, integration tests where appropriate, mock setup, happy path tests, edge cases, and error scenarios. Use Vitest syntax (describe, it, expect, vi.mock). Include proper TypeScript types. Make tests meaningful and not just trivial assertions.`,

  comment: `You are a code documentation expert. Add comprehensive inline documentation to the provided code. Include: JSDoc/TSDoc comments for all functions and classes, parameter descriptions with types, return value documentation, usage examples where helpful, and inline comments for complex logic. Preserve all original code — only ADD comments, never remove or modify existing code.`,
}

const titles: Record<string, string> = {
  readme: 'README.md',
  'api-doc': 'API Documentation',
  test: 'Test Suite',
  comment: 'Documented Code',
}

const languages: Record<string, string> = {
  readme: 'markdown',
  'api-doc': 'markdown',
  test: 'typescript',
  comment: 'typescript',
}

export async function POST(req: NextRequest) {
  try {
    const { code, type = 'readme' } = await req.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    const systemPrompt = typePrompts[type] || typePrompts.readme
    const userContent = `Generate ${type} documentation for this code:\n\n${code}`

    const result = await analyzeWithWatsonx(systemPrompt, userContent, {
      temperature: 0.4,
      maxNewTokens: 3000,
    })

    return NextResponse.json({
      title: titles[type] || 'document',
      doc: result,
      language: languages[type] || 'markdown',
    })
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json({ error: 'Failed to generate documentation' }, { status: 500 })
  }
}
