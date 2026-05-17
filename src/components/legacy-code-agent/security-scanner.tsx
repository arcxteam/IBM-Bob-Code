'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { CanvasBackground } from '@/components/legacy-code-agent/canvas-background'
import { useAppStore, type SecurityFinding } from '@/store/use-app-store'
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Bug,
  Lock,
  Database,
  KeyRound,
  FileWarning,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const sampleCode = `// config.ts - Configuration with hardcoded secrets
export const config = {
  database: {
    host: 'prod-db.internal.com',
    port: 5432,
    username: 'admin',
    password: 'SuperSecretP@ssw0rd123!',
    apiKey: 'sk-live-4eC39HqLyjWDarjtT1zdp7dc',
  },
  jwt: {
    secret: 'my-super-secret-jwt-key-2024',
    expiresIn: '24h',
    algorithm: 'HS256',
  },
  stripe: {
    publicKey: 'pk_live_abc123',
    privateKey: 'sk_live_xyz789',
  },
};

// api/users.ts
import { config } from '../config';
import { db } from '../database';
import jwt from 'jsonwebtoken';

export async function getUser(req, res) {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, config.jwt.secret);
  
  // SQL Injection vulnerability
  const userId = req.query.id;
  const query = \`SELECT * FROM users WHERE id = \${userId}\`;
  const user = await db.raw(query);
  
  // XSS vulnerability - unsanitized output
  res.send(\`<h1>Welcome \${user.name}</h1>\`);
  
  // Path traversal
  const filename = req.query.file;
  const filePath = \`./uploads/\${filename}\`;
  const file = fs.readFileSync(filePath);
  res.send(file);
}

export async function login(req, res) {
  const { username, password } = req.body;
  
  // No rate limiting, no brute-force protection
  const user = await db.query(\`SELECT * FROM users WHERE username = '\${username}' AND password = '\${password}'\`);
  
  if (user) {
    // Weak JWT with no expiration enforcement
    const token = jwt.sign({ id: user.id, role: user.role }, config.jwt.secret);
    res.json({ token });
  } else {
    // Information leakage in error
    res.status(401).json({ error: 'Invalid credentials for user: ' + username });
  }
}

// middleware/upload.ts
import crypto from 'crypto';

export function hashPassword(password) {
  // Weak hashing - MD5 is cryptographically broken
  return crypto.createHash('md5').update(password).digest('hex');
}

export function encryptData(data) {
  // Weak encryption - DES is insecure
  const cipher = crypto.createCipher('des', config.encryptionKey);
  return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
}

// eval vulnerability
export function processTemplate(template, data) {
  // Remote code execution via eval
  return eval(\`"\${template}"\`);
}`

function getSeverityStyle(severity: string) {
  const styles: Record<string, string> = {
    critical: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    high: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    low: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    info: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  }
  return styles[severity] || styles.info
}

function getSeverityIcon(severity: string) {
  switch (severity) {
    case 'critical': return ShieldAlert
    case 'high': return AlertTriangle
    case 'medium': return Bug
    case 'low': return Info
    default: return CheckCircle2
  }
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'injection': return Database
    case 'auth': return Lock
    case 'crypto': return KeyRound
    case 'config': return FileWarning
    case 'dependency': return RefreshCw
    case 'data': return EyeOff
    default: return Bug
  }
}

export function SecurityScanner() {
  const {
    codeInput, setCodeInput,
    isSecurityScanning, setIsSecurityScanning,
    securityFindings, setSecurityFindings,
    setProjectAnalyzed,
  } = useAppStore()

  const [expandedFinding, setExpandedFinding] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [filterSeverity, setFilterSeverity] = useState<string>('all')

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleScan = useCallback(async () => {
    if (!codeInput.trim()) return
    setIsSecurityScanning(true)

    try {
      const res = await fetch('/api/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeInput }),
      })
      const data = await res.json()
      if (!res.ok || !data.findings) throw new Error('API Error')
      if (Array.isArray(data.findings)) {
        const findings: SecurityFinding[] = data.findings.map((f: Record<string, unknown>, i: number) => ({
          id: `sec-${Date.now()}-${i}`,
          severity: (f.severity as SecurityFinding['severity']) || 'medium',
          category: (f.category as SecurityFinding['category']) || 'error',
          title: String(f.title || 'Unknown vulnerability'),
          description: String(f.description || ''),
          file: String(f.file || 'unknown'),
          line: Number(f.line) || 0,
          code: String(f.code || ''),
          recommendation: String(f.recommendation || ''),
          cwe: f.cwe ? String(f.cwe) : undefined,
        }))
        setSecurityFindings(findings)
      }
    } catch {
      // Fallback demo findings
      const fallbackFindings: SecurityFinding[] = [
        {
          id: 'sec-fallback-1', severity: 'info', category: 'error',
          title: 'API Rate Limit Exceeded',
          description: 'The deep AI security scan could not be completed because the AI engine rate limit was reached.',
          file: 'system', line: 0,
          code: '// Rate Limit Exceeded',
          recommendation: 'Wait a few moments and try running the security scan again.',
          cwe: 'N/A',
        }
      ]
      setSecurityFindings(fallbackFindings)
    }

    setProjectAnalyzed(true)
    setIsSecurityScanning(false)
  }, [codeInput, setIsSecurityScanning, setSecurityFindings, setProjectAnalyzed])

  const handleLoadSample = () => {
    setCodeInput(sampleCode)
  }

  const findingsList = Array.isArray(securityFindings) ? securityFindings : []
  const filteredFindings = filterSeverity === 'all'
    ? findingsList
    : findingsList.filter(f => f.severity === filterSeverity)

  const severityCounts = {
    critical: findingsList.filter(f => f.severity === 'critical').length,
    high: findingsList.filter(f => f.severity === 'high').length,
    medium: findingsList.filter(f => f.severity === 'medium').length,
    low: findingsList.filter(f => f.severity === 'low').length,
    info: findingsList.filter(f => f.severity === 'info').length,
  }

  const securityScore = findingsList.length > 0
    ? Math.max(0, 100 - (severityCounts.critical * 20 + severityCounts.high * 12 + severityCounts.medium * 5 + severityCounts.low * 2 + severityCounts.info * 0.5))
    : 100

  const severityFilters = [
    { key: 'all', label: 'All' },
    { key: 'critical', label: 'Critical', color: 'text-red-500' },
    { key: 'high', label: 'High', color: 'text-orange-500' },
    { key: 'medium', label: 'Medium', color: 'text-amber-500' },
    { key: 'low', label: 'Low', color: 'text-sky-500' },
    { key: 'info', label: 'Info', color: 'text-emerald-500' },
  ]

  return (
    <div className="relative min-h-screen overflow-y-auto">
      <CanvasBackground variant="module" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Security Scanner</h1>
              <p className="text-sm text-muted-foreground">AI-powered vulnerability detection across your codebase</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs bg-violet-500/5 border-violet-500/20 text-violet-600 dark:text-violet-400">
            <Sparkles className="w-3 h-3 mr-1" />
            Powered by IBM Bob AI — Full Context Security Audit
          </Badge>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Input */}
          <div className="lg:col-span-2">
            <Card className="border-border/50 bg-card/60 backdrop-blur-sm sticky top-8">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Code to Scan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <textarea
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="Paste code to scan for security vulnerabilities..."
                  className="w-full min-h-[300px] p-3 rounded-lg border border-border bg-muted/30 font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleLoadSample} className="text-xs flex-1">
                    Load Sample
                  </Button>
                  <Button
                    onClick={handleScan}
                    disabled={!codeInput.trim() || isSecurityScanning}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white flex-1"
                  >
                    {isSecurityScanning ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Scanning...</>
                    ) : (
                      <><ShieldCheck className="w-4 h-4 mr-2" />Scan with Bob</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-4">
            <AnimatePresence mode="wait">
              {findingsList.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="border-dashed border-border/50 h-[500px] flex items-center justify-center bg-card/60 backdrop-blur-sm">
                    <CardContent className="text-center p-8">
                      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                      <h3 className="font-semibold mb-2">No Security Scan Yet</h3>
                      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                        Paste your code and let Bob detect vulnerabilities, hardcoded secrets, injection risks, and weak cryptographic patterns.
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
                  {/* Security Score & Summary */}
                  <Card className="border-border/50 bg-card/60 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg',
                            securityScore >= 80 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                            securityScore >= 50 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                            'bg-red-500/10 text-red-600 dark:text-red-400'
                          )}>
                            {securityScore}
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Security Score</p>
                            <p className="text-sm font-semibold">out of 100</p>
                          </div>
                        </div>
                        <Progress value={securityScore} className={cn(
                          'w-1/3 h-2',
                          securityScore >= 80 ? '[&>div]:bg-emerald-500' :
                          securityScore >= 50 ? '[&>div]:bg-amber-500' :
                          '[&>div]:bg-red-500'
                        )} />
                      </div>

                      <div className="grid grid-cols-5 gap-2">
                        {Object.entries(severityCounts).filter(([, count]) => count > 0).map(([sev, count]) => (
                          <button
                            key={sev}
                            onClick={() => setFilterSeverity(filterSeverity === sev ? 'all' : sev)}
                            className={cn(
                              'text-center p-2 rounded-lg border transition-all',
                              filterSeverity === sev
                                ? getSeverityStyle(sev)
                                : 'border-border/30 hover:border-border'
                            )}
                          >
                            <p className="text-lg font-bold">{count}</p>
                            <p className="text-[9px] uppercase font-semibold tracking-wider">{sev}</p>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap gap-2">
                    {severityFilters.map((sf) => (
                      <button
                        key={sf.key}
                        onClick={() => setFilterSeverity(sf.key)}
                        className={cn(
                          'text-xs px-3 py-1.5 rounded-full border transition-all',
                          filterSeverity === sf.key
                            ? 'bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-400 font-semibold'
                            : 'border-border/40 text-muted-foreground hover:border-border'
                        )}
                      >
                        {sf.label}
                        {sf.key !== 'all' && (
                          <span className="ml-1 text-[10px]">({severityCounts[sf.key as keyof typeof severityCounts]})</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Findings List */}
                  <ScrollArea className="max-h-[600px]">
                    <div className="space-y-3 pr-4">
                      {filteredFindings.length === 0 ? (
                        <div className="text-center py-8">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No findings for this severity level.</p>
                        </div>
                      ) : (
                        filteredFindings.map((finding) => {
                          const SeverityIcon = getSeverityIcon(finding.severity)
                          const CategoryIcon = getCategoryIcon(finding.category)
                          const isExpanded = expandedFinding === finding.id

                          return (
                            <motion.div
                              key={finding.id}
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                            >
                              <Card className={cn('border transition-all bg-card/60 backdrop-blur-sm', isExpanded && 'shadow-md')}>
                                <CardContent className="p-4">
                                  <div className="flex items-start gap-3">
                                    <div className={cn(
                                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border',
                                      getSeverityStyle(finding.severity)
                                    )}>
                                      <SeverityIcon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <h4 className="text-sm font-semibold">{finding.title}</h4>
                                        <Badge variant="outline" className={cn('text-[10px] h-5', getSeverityStyle(finding.severity))}>
                                          {finding.severity}
                                        </Badge>
                                        <Badge variant="secondary" className="text-[10px] h-5">
                                          <CategoryIcon className="w-2.5 h-2.5 mr-1" />
                                          {finding.category}
                                        </Badge>
                                        {finding.cwe && (
                                          <Badge variant="outline" className="text-[10px] h-5 bg-muted/50">
                                            {finding.cwe}
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-xs text-muted-foreground leading-relaxed mb-2">{finding.description}</p>

                                      <button
                                        onClick={() => setExpandedFinding(isExpanded ? null : finding.id)}
                                        className="text-xs text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                                      >
                                        {isExpanded ? 'Hide details' : 'View details & fix'}
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
                                            <div className="mt-3 space-y-3">
                                              {/* Vulnerable code */}
                                              {finding.code && (
                                                <div>
                                                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                                    <XCircle className="w-3 h-3 text-red-400" />
                                                    Vulnerable Code
                                                    <span className="text-[10px] text-muted-foreground font-normal ml-1">{finding.file}:{finding.line}</span>
                                                  </p>
                                                  <div className="relative">
                                                    <pre className="p-3 rounded-lg bg-red-500/5 border border-red-500/10 text-xs font-mono overflow-x-auto">
                                                      <code className="text-red-700 dark:text-red-300">{finding.code}</code>
                                                    </pre>
                                                  </div>
                                                </div>
                                              )}

                                              {/* Recommendation */}
                                              <div>
                                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                                  <Zap className="w-3 h-3 text-emerald-400" />
                                                  Recommendation
                                                </p>
                                                <div className="relative">
                                                  <button
                                                    onClick={() => handleCopy(finding.recommendation, finding.id)}
                                                    className="absolute top-2 right-2 text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 bg-background/80 rounded px-1.5 py-0.5"
                                                  >
                                                    {copied === finding.id ? (
                                                      <><Check className="w-3 h-3" />Copied</>
                                                    ) : (
                                                      <><Copy className="w-3 h-3" />Copy</>
                                                    )}
                                                  </button>
                                                  <p className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                                                    {finding.recommendation}
                                                  </p>
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
                        })
                      )}
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
