import { NextRequest, NextResponse } from 'next/server'
import { callWatsonx, type WatsonxMessage } from '@/lib/watsonx'
import { callBobProxy } from '@/lib/bob-proxy'

export async function POST(req: NextRequest) {
  try {
    const { message, codeContext, history } = await req.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const systemPrompt = `You are an expert code flow analyst and software architect. Your role is to help developers understand how code works by tracing data flows, explaining execution paths, and identifying dependencies between components.

Provide clear, structured responses using markdown formatting. Use numbered lists for steps, code blocks for examples, and headers for sections. Be conversational but technical.
Focus on practical insights that help developers understand the codebase.`

    const messages: WatsonxMessage[] = [
      { role: 'system', content: systemPrompt },
    ]

    if (codeContext && codeContext.trim()) {
      messages.push({
        role: 'user',
        content: `Here is the codebase context to analyze:\n\n\`\`\`\n${codeContext.slice(0, 8000)}\n\`\`\``,
      })
      messages.push({
        role: 'assistant',
        content: 'I have analyzed the codebase context. I\'m ready to answer your questions about the code structure, data flows, and architecture.',
      })
    }

    const recentHistory = (history ?? []).slice(-8) as Array<{ role: string; content: string }>
    for (const msg of recentHistory) {
      const role = msg.role === 'assistant' ? 'assistant' as const : 'user' as const
      messages.push({ role, content: msg.content })
    }

    messages.push({ role: 'user', content: message })

    const bobPrompt = `${systemPrompt}\n\n${codeContext ? `Code context:\n\`\`\`\n${codeContext.slice(0, 4000)}\n\`\`\`\n\n` : ''}${message}`
    const bobResult = await callBobProxy(bobPrompt, { chatMode: "advanced", maxCoins: 3 })

    let response: string
    if (bobResult.success && bobResult.output) {
      response = bobResult.output
    } else {
      response = await callWatsonx(messages, {
        temperature: 0.3,
        maxNewTokens: 1500,
      })
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { response: '## Flow Analysis Unavailable\n\nThe AI analysis service is currently unavailable. Please try again in a moment.\n\nIn the meantime, you can:\n1. Trace the code manually by following function calls\n2. Look for `import` statements to map dependencies\n3. Check for data transformation patterns (map, filter, reduce)' },
      { status: 200 }
    )
  }
}
