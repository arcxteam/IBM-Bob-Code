'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore, type RefactorSuggestion } from '@/store/use-app-store'
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Zap,
  RefreshCw,
  Shield,
  FileCode2,
  Code2,
  AlertOctagon,
  Layers,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CanvasBackground } from '@/components/legacy-code-agent/canvas-background'

const sampleCode = `// Legacy pattern example - before refactoring
function processUserData(users) {
  var result = [];
  for (var i = 0; i < users.length; i++) {
    if (users[i].active == true) {
      var name = users[i].firstName + ' ' + users[i].lastName;
      var email = users[i].email;
      if (email != null && email != undefined && email != '') {
        result.push({
          fullName: name,
          emailAddress: email,
          status: 'active'
        });
      }
    }
  }
  return result;
}

// Using deprecated API
var request = new XMLHttpRequest();
request.open('GET', '/api/users', true);

// Callback hell
function fetchUser(id, callback) {
  db.query('SELECT * FROM users WHERE id = ?', [id], function(err, user) {
    if (err) {
      callback(err);
    } else {
      db.query('SELECT * FROM posts WHERE userId = ?', [user.id], function(err, posts) {
        if (err) {
          callback(err);
        } else {
          callback(null, { user, posts });
        }
      });
    }
  });
}

// Duplicated validation logic
function validateEmail(email) {
  if (email == null) return false;
  if (email == undefined) return false;
  if (email == '') return false;
  var re = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return re.test(email);
}

function isEmailValid(email) {
  if (!email) return false;
  var pattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return pattern.test(email);
}

// Magic numbers
function calculateDiscount(price) {
  if (price > 100) {
    return price * 0.85;
  } else if (price > 50) {
    return price * 0.90;
  } else {
    return price * 0.95;
  }
}`

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'critical': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
    case 'high': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20'
    case 'medium': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
    default: return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
  }
}

function getSeverityIcon(severity: string) {
  switch (severity) {
    case 'critical': return AlertOctagon
    case 'high': return AlertTriangle
    case 'medium': return Shield
    default: return CheckCircle2
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'pattern': return Layers
    case 'boilerplate': return FileCode2
    case 'migration': return RefreshCw
    default: return Code2
  }
}

export function SmartRefactor() {
  const {
    codeInput, setCodeInput,
    isRefactoring, setIsRefactoring,
    refactoringSuggestions, setRefactoringSuggestions,
    setProjectAnalyzed,
  } = useAppStore()

  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleRefactor = useCallback(async () => {
    if (!codeInput.trim()) return
    setIsRefactoring(true)

    try {
      const res = await fetch('/api/refactor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeInput }),
      })
      const data = await res.json()
      if (!res.ok || !data.suggestions) throw new Error('API Error')
      if (Array.isArray(data.suggestions)) {
        setRefactoringSuggestions(data.suggestions)
      }
    } catch {
      const fallbackSuggestions: RefactorSuggestion[] = [
        {
          id: '1',
          type: 'pattern',
          title: 'API Rate Limit Exceeded',
          description: 'The AI engine is currently experiencing high traffic and could not generate smart refactoring suggestions for this code.',
          severity: 'low',
          code: '// API Rate Limit Exceeded',
          suggestion: 'Please wait a few moments and try running the analysis again.',
          file: 'system',
          line: 0,
        }
      ]
      setRefactoringSuggestions(fallbackSuggestions)
    }

    setProjectAnalyzed(true)
    setIsRefactoring(false)
  }, [codeInput, setIsRefactoring, setRefactoringSuggestions, setProjectAnalyzed])

  const handleLoadSample = () => {
    setCodeInput(sampleCode)
  }

  const suggestionsList = Array.isArray(refactoringSuggestions) ? refactoringSuggestions : []
  const severityCounts = {
    critical: suggestionsList.filter(s => s.severity === 'critical').length,
    high: suggestionsList.filter(s => s.severity === 'high').length,
    medium: suggestionsList.filter(s => s.severity === 'medium').length,
    low: suggestionsList.filter(s => s.severity === 'low').length,
  }

  const totalSuggestions = suggestionsList.length
  const score = totalSuggestions > 0 ? Math.max(0, 100 - (severityCounts.critical * 15 + severityCounts.high * 10 + severityCounts.medium * 5 + severityCounts.low * 2)) : 0

  return (
    <div className="relative min-h-screen overflow-y-auto">
      <CanvasBackground variant="module" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Smart Refactoring</h1>
              <p className="text-sm text-muted-foreground">AI-powered pattern detection & code improvement</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400">
            <Sparkles className="w-3 h-3 mr-1" />
            Powered by IBM Bob AI — Cross-File Analysis
          </Badge>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Input */}
          <div className="lg:col-span-2">
            <Card className="border-border/50 sticky top-8">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Code to Refactor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <textarea
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="Paste code to analyze for refactoring opportunities..."
                  className="w-full min-h-[300px] p-3 rounded-lg border border-border bg-muted/30 font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleLoadSample} className="text-xs flex-1">
                    Load Sample
                  </Button>
                  <Button
                    onClick={handleRefactor}
                    disabled={!codeInput.trim() || isRefactoring}
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white flex-1"
                  >
                    {isRefactoring ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</>
                    ) : (
                      <><Zap className="w-4 h-4 mr-2" />Detect Patterns</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-4">
            <AnimatePresence mode="wait">
              {suggestionsList.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="border-dashed border-border/50 h-[500px] flex items-center justify-center">
                    <CardContent className="text-center p-8">
                      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                        <Wrench className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                      <h3 className="font-semibold mb-2">No Refactoring Suggestions Yet</h3>
                      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                        Paste your code and let Bob detect patterns, deprecated APIs, and optimization opportunities.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Summary */}
                  <Card className="border-border/50">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{severityCounts.critical}</p>
                          <p className="text-[10px] text-muted-foreground">Critical</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{severityCounts.high}</p>
                          <p className="text-[10px] text-muted-foreground">High</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{severityCounts.medium}</p>
                          <p className="text-[10px] text-muted-foreground">Medium</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{severityCounts.low}</p>
                          <p className="text-[10px] text-muted-foreground">Low</p>
                        </div>
                      </div>
                      <Separator className="my-3" />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Code Quality Score</p>
                          <p className="text-lg font-bold">{score}/100</p>
                        </div>
                        <Progress value={score} className="w-1/2 h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Suggestions */}
                  <ScrollArea className="max-h-[600px]">
                    <div className="space-y-3 pr-4">
                      {suggestionsList.map((suggestion) => {
                        const SeverityIcon = getSeverityIcon(suggestion.severity)
                        const TypeIcon = getTypeIcon(suggestion.type)
                        const isExpanded = expandedSuggestion === suggestion.id

                        return (
                          <motion.div
                            key={suggestion.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <Card className={cn('border transition-all', isExpanded && 'shadow-md')}>
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className={cn(
                                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border',
                                    getSeverityColor(suggestion.severity)
                                  )}>
                                    <SeverityIcon className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="text-sm font-semibold">{suggestion.title}</h4>
                                      <Badge variant="outline" className={cn('text-[10px] h-5', getSeverityColor(suggestion.severity))}>
                                        {suggestion.severity}
                                      </Badge>
                                      <Badge variant="secondary" className="text-[10px] h-5">
                                        <TypeIcon className="w-2.5 h-2.5 mr-1" />
                                        {suggestion.type}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                                      {suggestion.description}
                                    </p>

                                    <button
                                      onClick={() => setExpandedSuggestion(isExpanded ? null : suggestion.id)}
                                      className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                                    >
                                      {isExpanded ? 'Hide code' : 'View code diff'}
                                      <ArrowRight className={cn('w-3 h-3 transition-transform', isExpanded && 'rotate-90')} />
                                    </button>

                                    <AnimatePresence>
                                      {isExpanded && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: 'auto', opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.2 }}
                                          className="overflow-hidden"
                                        >
                                          <div className="mt-3 space-y-2">
                                            <div className="relative">
                                              <div className="absolute left-0 top-0 bottom-0 w-3 bg-red-500/20 rounded-l-md" />
                                              <pre className="p-3 pl-6 rounded-lg bg-red-500/5 border border-red-500/10 text-xs font-mono overflow-x-auto">
                                                <code className="text-red-700 dark:text-red-300">{suggestion.code}</code>
                                              </pre>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <ArrowRight className="w-4 h-4 text-emerald-500" />
                                              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Refactored</span>
                                            </div>
                                            <div className="relative">
                                              <div className="absolute left-0 top-0 bottom-0 w-3 bg-emerald-500/20 rounded-l-md" />
                                              <div className="relative">
                                                <button
                                                  onClick={() => handleCopy(suggestion.suggestion, suggestion.id)}
                                                  className="absolute top-2 right-2 text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 bg-background/80 rounded px-1.5 py-0.5"
                                                >
                                                  {copied === suggestion.id ? (
                                                    <><Check className="w-3 h-3" />Copied</>
                                                  ) : (
                                                    <><Copy className="w-3 h-3" />Copy</>
                                                  )}
                                                </button>
                                                <pre className="p-3 pl-6 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-xs font-mono overflow-x-auto">
                                                  <code className="text-emerald-700 dark:text-emerald-300">{suggestion.suggestion}</code>
                                                </pre>
                                              </div>
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
