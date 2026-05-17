'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'

import { useAppStore } from '@/store/use-app-store'
import {
  FileText,
  Loader2,
  Sparkles,
  Copy,
  Check,
  BookOpen,
  TestTube2,
  FileCode2,
  MessageSquare,
  Wand2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CanvasBackground } from '@/components/legacy-code-agent/canvas-background'

const sampleCode = `// auth-middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { getUserById } from '../services/userService';
import { Logger } from '../middleware/logger';

const logger = new Logger('AuthMiddleware');

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);
    const user = await getUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication failed', { error });
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

export function authorize(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

// userRoutes.ts
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth-middleware';
import * as userService from '../services/userService';

const router = Router();

router.get('/users', authenticate, authorize(['admin']), async (req, res) => {
  const users = await userService.getAllUsers();
  res.json(users);
});

router.get('/users/:id', authenticate, async (req, res) => {
  const user = await userService.getUser(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.post('/users', authenticate, authorize(['admin']), async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(201).json(user);
});

router.put('/users/:id', authenticate, async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.json(user);
});

router.delete('/users/:id', authenticate, authorize(['admin']), async (req, res) => {
  await userService.deleteUser(req.params.id);
  res.status(204).send();
});

export default router;`

type DocType = 'readme' | 'api-doc' | 'test' | 'comment'

const docTypes: { value: DocType; label: string; description: string; icon: React.ElementType }[] = [
  { value: 'readme', label: 'README', description: 'Project documentation', icon: BookOpen },
  { value: 'api-doc', label: 'API Documentation', description: 'Endpoint reference', icon: FileText },
  { value: 'test', label: 'Test Suite', description: 'Unit & integration tests', icon: TestTube2 },
  { value: 'comment', label: 'Inline Comments', description: 'Code annotations', icon: MessageSquare },
]

export function DocGenerator() {
  const {
    codeInput, setCodeInput,
    isGenerating, setIsGenerating,
    generatedDocs, setGeneratedDocs,
    setProjectAnalyzed,
  } = useAppStore()

  const [selectedType, setSelectedType] = useState<DocType>('readme')
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleGenerate = useCallback(async () => {
    if (!codeInput.trim()) return
    setIsGenerating(true)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeInput, type: selectedType }),
      })
      const data = await res.json()
      if (!res.ok || !data.doc) {
        throw new Error(data.error || 'Failed to generate documentation')
      }
      if (typeof data.doc === 'string') {
        const newDoc = { id: `doc-${Date.now()}`, type: selectedType, title: data.title || 'Document', content: data.doc, language: data.language || 'markdown' }
        setGeneratedDocs([newDoc])
      }
    } catch {
      const fallbackDocs: Record<DocType, { title: string; content: string; language?: string }> = {
        readme: {
          title: 'README.md',
          content: `⚠️ **API Rate Limit Exceeded**\n\nDeep documentation generation is temporarily unavailable due to AI engine rate limits.\n\nPlease wait a few moments and try generating your documentation again.`,
          language: 'markdown',
        },
        'api-doc': {
          title: 'API Documentation',
          content: `⚠️ **API Rate Limit Exceeded**\n\nDeep API documentation generation is temporarily unavailable due to AI engine rate limits.\n\nPlease wait a few moments and try generating your API documentation again.`,
          language: 'markdown',
        },
        test: {
          title: 'Test Suite',
          content: `// ⚠️ API Rate Limit Exceeded\n// The AI engine is currently unavailable to generate test suites.\n// Please wait a few moments and try again.\n\nexport const error = "Rate Limit Exceeded";`,
          language: 'typescript',
        },
        'comment': {
          title: 'Inline Comments',
          content: `// ⚠️ API Rate Limit Exceeded\n// The AI engine is currently unavailable to generate inline comments.\n// Please wait a few moments and try again.\n\nexport const error = "Rate Limit Exceeded";`,
          language: 'typescript',
        },
      }

      const doc = fallbackDocs[selectedType]
      const newDoc = {
        id: `doc-${Date.now()}`,
        type: selectedType,
        title: doc.title,
        content: doc.content,
        language: doc.language,
      }
      setGeneratedDocs([newDoc])
    }

    setProjectAnalyzed(true)
    setIsGenerating(false)
  }, [codeInput, selectedType, setIsGenerating, setGeneratedDocs, setProjectAnalyzed])

  const handleLoadSample = () => {
    setCodeInput(sampleCode)
  }

  return (
    <div className="relative min-h-screen overflow-y-auto">
      <CanvasBackground variant="module" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Docs & Test A/B</h1>
              <p className="text-sm text-muted-foreground">Auto-generate documentation and tests with AI</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs bg-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400">
            <Sparkles className="w-3 h-3 mr-1" />
            Powered by IBM Bob AI — Context-Aware Generation
          </Badge>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="space-y-4">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Source Code</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleLoadSample} className="text-xs h-7">
                    Load Sample
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="Paste your code to generate documentation or tests..."
                  className="min-h-[250px] font-mono text-xs resize-none"
                />
              </CardContent>
            </Card>

            {/* Type Selection */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Generation Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {docTypes.map((dt) => {
                    const Icon = dt.icon
                    return (
                      <button
                        key={dt.value}
                        onClick={() => setSelectedType(dt.value)}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                          selectedType === dt.value
                            ? 'border-rose-500/30 bg-rose-500/5'
                            : 'border-border/50 hover:border-border'
                        )}
                      >
                        <Icon className={cn(
                          'w-5 h-5 flex-shrink-0',
                          selectedType === dt.value ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground'
                        )} />
                        <div>
                          <p className="text-xs font-semibold">{dt.label}</p>
                          <p className="text-[10px] text-muted-foreground">{dt.description}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!codeInput.trim() || isGenerating}
                  className="w-full mt-4 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white"
                >
                  {isGenerating ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                  ) : (
                    <><Wand2 className="w-4 h-4 mr-2" />Generate with Bob</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Output */}
          <div>
            <Card className="border-border/50 sticky top-8">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <FileCode2 className="w-4 h-4" />
                    Generated Output
                  </CardTitle>
                  <Badge variant="secondary" className="text-[10px]">
                    {Array.isArray(generatedDocs) ? generatedDocs.length : 0} document{(Array.isArray(generatedDocs) ? generatedDocs.length : 0) !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {!Array.isArray(generatedDocs) || generatedDocs.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="font-semibold mb-2">No Documents Generated</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      Select a generation type and click generate to create context-aware documentation.
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[600px]">
                    <div className="space-y-4 pr-4">
                      {(Array.isArray(generatedDocs) ? generatedDocs : []).map((doc) => (
                        <div key={doc.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px]">{doc.type}</Badge>
                              <span className="text-xs font-semibold">{doc.title}</span>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleCopy(doc.content, doc.id)}
                                className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 p-1.5 rounded hover:bg-accent"
                              >
                                {copied === doc.id ? (
                                  <><Check className="w-3 h-3" />Copied</>
                                ) : (
                                  <><Copy className="w-3 h-3" />Copy</>
                                )}
                              </button>
                            </div>
                          </div>
                          <pre className="p-4 rounded-lg bg-muted/30 border border-border/50 text-xs font-mono overflow-x-auto max-h-[500px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                            {doc.content}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
