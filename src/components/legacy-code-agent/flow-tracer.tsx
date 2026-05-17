'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore } from '@/store/use-app-store'
import type { ChatMessage } from '@/store/use-app-store'
import {
  GitBranch,
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  ArrowDown,
  Copy,
  Check,
  Trash2,
  Code2,
  MessageSquare,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CanvasBackground } from '@/components/legacy-code-agent/canvas-background'

const sampleQuestions = [
  'How does data flow from the API endpoint to the database?',
  'What happens when a new user is created? Trace the full flow.',
  'How are notifications sent after user actions?',
  'What is the dependency chain of the authentication module?',
  'Explain the error handling strategy across services.',
]

const welcomeMessage: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `👋 Hello! I'm **Bob**, your AI-powered Flow Tracer. I understand the full context of your codebase.

I can help you:

• 🔍 **Trace data flows** — Follow data from endpoints through services to the database
• 🔗 **Map dependencies** — See how modules and functions interact
• 🧩 **Explain architecture decisions** — Understand why code is structured the way it is
• 🐛 **Identify bottlenecks** — Find potential issues in code flows

Paste your code in the **Code Explorer** tab first, then ask me anything about it!

Or try one of the sample questions below:`,
  timestamp: new Date(),
}

export function FlowTracer() {
  const {
    chatMessages,
    addChatMessage,
    clearChatMessages,
    isChatLoading,
    setIsChatLoading,
    codeInput,
    setProjectAnalyzed,
  } = useAppStore()

  const [input, setInput] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (chatMessages.length === 0) {
      addChatMessage(welcomeMessage)
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatMessages])

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleSend = async () => {
    if (!input.trim() || isChatLoading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    addChatMessage(userMessage)
    setInput('')
    setIsChatLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          codeContext: codeInput,
          history: chatMessages.slice(-10).map(m => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.response) throw new Error('API Error')
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }
      addChatMessage(assistantMessage)
    } catch {
      const fallbackMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **API Rate Limit Exceeded**\n\nI am currently experiencing high traffic and could not process your flow trace request through the AI engine.\n\nPlease wait a few moments and try your question again.`,
        timestamp: new Date(),
      }
      addChatMessage(fallbackMessage)
    }

    setProjectAnalyzed(true)
    setIsChatLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSampleQuestion = (question: string) => {
    setInput(question)
    inputRef.current?.focus()
  }

  return (
    <div className="relative min-h-screen flex flex-col h-screen">
      <CanvasBackground variant="module" />
      {/* Header */}
      <div className="relative z-10 flex-shrink-0 border-b border-border/50 px-4 md:px-8 py-4 bg-card/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Flow Tracer</h1>
              <p className="text-xs text-muted-foreground">Interactive code flow analysis</p>
            </div>
            <Badge variant="outline" className="text-[10px] bg-violet-500/5 border-violet-500/20 text-violet-600 dark:text-violet-400 ml-2">
              <Sparkles className="w-2.5 h-2.5 mr-1" />
              IBM Bob AI
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChatMessages}
            className="text-muted-foreground"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-4 md:px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <AnimatePresence mode="popLayout">
            {chatMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className={cn(
                  'max-w-[85%] group relative',
                  message.role === 'user' ? 'order-first' : ''
                )}>
                  <Card className={cn(
                    'border-border/50',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground border-primary/20'
                      : 'bg-card/50 backdrop-blur-sm'
                  )}>
                    <CardContent className="p-4">
                      <div className="text-sm leading-relaxed whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">
                        {message.content.split(/(\*\*.*?\*\*|`[^`]+`|#{1,3}\s.*)/).map((part, i) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={i}>{part.slice(2, -2)}</strong>
                          }
                          if (part.startsWith('`') && part.endsWith('`')) {
                            return <code key={i} className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">{part.slice(1, -1)}</code>
                          }
                          if (part.startsWith('### ')) {
                            return <p key={i} className="font-semibold text-sm mt-3 mb-1">{part.slice(4)}</p>
                          }
                          if (part.startsWith('## ')) {
                            return <p key={i} className="font-bold text-base mt-3 mb-1">{part.slice(3)}</p>
                          }
                          return <span key={i}>{part}</span>
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-1 mt-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopy(message.content, message.id)}
                        className="text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                      >
                        {copied === message.id ? (
                          <><Check className="w-3 h-3" />Copied</>
                        ) : (
                          <><Copy className="w-3 h-3" />Copy</>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isChatLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <Card className="border-border/50 bg-card/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm text-muted-foreground">Bob is analyzing your codebase...</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Sample Questions */}
          {chatMessages.length <= 1 && !isChatLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                Try asking:
              </p>
              <div className="flex flex-wrap gap-2">
                {sampleQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSampleQuestion(q)}
                    className="text-xs px-3 py-2 rounded-lg border border-border/50 hover:border-violet-500/30 hover:bg-violet-500/5 text-muted-foreground hover:text-foreground transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="relative z-10 flex-shrink-0 border-t border-border/50 px-4 md:px-8 py-4 bg-card/50 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Bob to trace any code flow..."
              className="min-h-[48px] max-h-[120px] pr-12 resize-none text-sm"
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isChatLoading}
              size="icon"
              className="absolute right-2 bottom-2 h-8 w-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white"
            >
              {isChatLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Powered by IBM Bob AI — reads your entire codebase context for accurate flow analysis. Press Enter to send, Shift+Enter for new line.
          </p>
        </div>
      </div>
    </div>
  )
}
